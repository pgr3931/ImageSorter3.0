const { fdir } = window.require("fdir");
const remote = window.require('electron').remote;
const fs = remote.require('fs');
const path = remote.require('path');

export interface RenderTree {
    id: string;
    name: string;
    path: string;
    children?: RenderTree[];
}

export const DESTINATIONDIRPATH = "D:\\Bilder\\Anime\\Images";

export const getAllDirs = async (dirPath: string) => {
    const crawler = new fdir();
    let dirs: string[] = crawler.withDirs().onlyDirs().withFullPaths().crawl(dirPath).sync();
    dirs.forEach((d, i, array) => array[i] = d.substr(dirPath.length + 1));
    dirs = dirs.filter(d => d);
    return dirs;
}

const findLewds = (tree?: RenderTree) => {
    if (tree?.children) {
        if (tree.children.length === 1 && tree.children[0].id.includes('-l')) {
            tree.id += '-lp';
        }

        for (const child of tree.children) {
            findLewds(child);
        }
    }
};

let id = 0;
export const processDirs = (dirs: string[]): RenderTree => {
    let result: RenderTree[] = [];
    let level = { result };

    dirs.forEach((path: string) => {
        path.split('\\').reduce((r: { result: RenderTree[], [key: string]: any }, name) => {
            if (!r[name]) {
                r[name] = { result: [] };
                r.result.push({ name, id: id.toString() + (name.includes('Lewds') ? '-l' : ''), path: path, children: r[name].result });
                id++;
            }

            return r[name];
        }, level)
    })

    for (const child of result) {
        findLewds(child);
    }
    
    id = 0;
    return { id: 'root', name: DESTINATIONDIRPATH.split('\\').pop() ?? 'Root', path: DESTINATIONDIRPATH, children: result };
}

export const handleClick = (currImage: string, destPath: string, callback: Function) => {
    if (currImage) {
        const destinationPath = `${DESTINATIONDIRPATH}${path.sep}${destPath}${path.sep}${currImage.substr(currImage.lastIndexOf(path.sep) + 1)}`;
        fs.exists(destinationPath, (exists: boolean) => {
            if (exists) {
                callback(`File ${currImage.substr(currImage.lastIndexOf(path.sep) + 1)} already exisits`);
            } else {
                fs.rename(currImage, destinationPath, (err: any) => callback(err?.message));
            }
        });
    }
};