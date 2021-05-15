import isImage from 'is-image';
import React, { useContext, useEffect, useState } from 'react';
import { Context } from '../../App';
const remote = window.require('electron').remote;
const electronFs = remote.require('fs');
const { fdir } = window.require("fdir");
const trash = window.require('trash');

export const ORIGINDIRPATH = "D:\\Bilder\\Anime\\ImageDump";

const getImages = async (dirPath: string) => {
    const crawler = new fdir();
    return crawler.withFullPaths().filter((path: string) => isImage(path)).crawl(dirPath).sync();
}

const Images: React.FC<{ removeImg?: boolean, showError: Function }> = ({ removeImg, showError }) => {
    const { setCurrImg } = useContext(Context)
    const [images, setImages] = useState<string[]>([]);
    const imagesRef = React.useRef(images);
    const [currImage, setCurrImage] = useState<string>();
    const [currIndex, setCurrIndex] = useState<number>(0);
    const currIndexRef = React.useRef(currIndex);

    const removeImage = () => {
        imagesRef.current.splice(currIndexRef.current, 1);
        setImages([...imagesRef.current]);
        if (imagesRef.current.length) {
            if (currIndexRef.current + 1 >= imagesRef.current.length) {
                currIndexRef.current = currIndexRef.current - 1;
                setCurrIndex(currIndexRef.current);
            }
            setCurrImage(`data:image/${imagesRef.current[currIndexRef.current].substr(imagesRef.current[currIndexRef.current].lastIndexOf('.') + 1)};base64,${electronFs.readFileSync(imagesRef.current[currIndexRef.current]).toString('base64')}`);
            setCurrImg(imagesRef.current[currIndexRef.current]);
        } else {
            setCurrImage('');
            setCurrImg('');
            setCurrIndex(-1);
        }
    }

    useEffect(() => {
        if (removeImg !== undefined) {
            removeImage();
        }
    }, [removeImg])

    useEffect(() => {
        const init = async () => {
            const images = await getImages(ORIGINDIRPATH);
            if (images && images.length) {
                imagesRef.current = images;
                setImages(images);
                setCurrImage(`data:image/${images[0].substr(images[0].lastIndexOf('.') + 1)};base64,${electronFs.readFileSync(images[0]).toString('base64')}`);
                setCurrImg(images[0]);
            }
        }
        init();

        const increaseCurrIndex = () => {
            if (currIndexRef.current + 1 >= imagesRef.current.length) {
                currIndexRef.current = 0
                setCurrIndex(0);
            } else
                setCurrIndex(prev => { currIndexRef.current = prev + 1; return prev + 1 });
        };

        const decreaseCurrIndex = () => {
            if (currIndexRef.current - 1 < 0) {
                currIndexRef.current = imagesRef.current.length - 1;
                setCurrIndex(imagesRef.current.length - 1);
            } else
                setCurrIndex(prev => { currIndexRef.current = prev - 1; return prev - 1 });
        };

        const handleKeyDown = async (e: KeyboardEvent) => {
            if (imagesRef.current.length > 1) {
                if (e.key === 'ArrowRight') {
                    increaseCurrIndex();
                    setCurrImage(`data:image/${imagesRef.current[currIndexRef.current].substr(imagesRef.current[currIndexRef.current].lastIndexOf('.') + 1)};base64,${electronFs.readFileSync(imagesRef.current[currIndexRef.current]).toString('base64')}`);
                    setCurrImg(imagesRef.current[currIndexRef.current]);
                }
                if (e.key === 'ArrowLeft') {
                    decreaseCurrIndex();
                    setCurrImage(`data:image/${imagesRef.current[currIndexRef.current].substr(imagesRef.current[currIndexRef.current].lastIndexOf('.') + 1)};base64,${electronFs.readFileSync(imagesRef.current[currIndexRef.current]).toString('base64')}`);
                    setCurrImg(imagesRef.current[currIndexRef.current]);
                }
                if (e.key === 'Delete') {
                    try {
                        await trash(imagesRef.current[currIndexRef.current]);
                        removeImage();
                    } catch (err) {
                        showError(err?.message ?? 'Error while deleting');                        
                    }
                }
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [setCurrImg])

    return (
        <div style={{ height: '100%', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'column' }}>
            <img src={currImage} style={{ maxHeight: '95%', height: '95%', maxWidth: '100%', borderRadius: 5 }} alt="" />
            <div style={{ maxHeight: '5%', fontSize: 20 }}>{images?.length ? currIndex + 1 : 0} / {images?.length}</div>
        </div>
    );
};

export default Images;