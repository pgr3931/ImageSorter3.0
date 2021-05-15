import CircularProgress from '@material-ui/core/CircularProgress';
import Snackbar from '@material-ui/core/Snackbar';
import { makeStyles } from '@material-ui/core/styles';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Alert from '@material-ui/lab/Alert';
import TreeItem from '@material-ui/lab/TreeItem';
import TreeView from '@material-ui/lab/TreeView';
import React, { useContext, useEffect, useState } from 'react';
import { Context } from '../../App';
import { DESTINATIONDIRPATH, getAllDirs, handleClick, processDirs, RenderTree } from './DirectoriesController';

const useStyles = makeStyles({
    root: {
        height: 'calc(100%)',
        flexGrow: 1,
        maxWidth: 'calc(100%)',
        overflow: "auto",
        color: '#fafafa'
    },
});

const renderTree = (nodes: RenderTree, currImage: string, callback: Function) => (
    <TreeItem key={nodes.id} nodeId={nodes.id} label={nodes.name} onLabelClick={e => { e.preventDefault(); handleClick(currImage, nodes.path, callback) }}>
        {Array.isArray(nodes.children) ? nodes.children.map((node) => renderTree(node, currImage, callback)) : null}
    </TreeItem>
);

const Directories: React.FC<{ setRemoveImg: Function, showError: Function }> = ({ setRemoveImg, showError }) => {
    const { currImg } = useContext(Context);
    const classes = useStyles();
    const [dirs, setDirs] = useState<string[]>();
    const [treeData, setTreeData] = useState<RenderTree>();
    const [treeviewRef, setTreeViewRef] = useState<any>(null)

    useEffect(() => {
        if (treeviewRef) {
            treeviewRef!.onkeydown = (e: any) => {
                if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                    e.stopPropagation();
                    window.dispatchEvent(new KeyboardEvent('keydown', { key: e.key }));
                }
            };
        };
    }, [treeviewRef])

    useEffect(() => {
        const init = async () => {
            const d = await getAllDirs(DESTINATIONDIRPATH);
            setTreeData(processDirs(d));
            setDirs(d);
        }

        if (!dirs) {
            init();
        }
    }, [dirs])

    const handleToggle = (event: any) => {
        const iconClicked = event.target.closest(".MuiTreeItem-iconContainer");
        if (!iconClicked) {
            event.preventDefault()
        }
    };

    const callback = (err: string) => {
        if (err) {
            showError(err);       
        } else {
            setRemoveImg();
        }
    }

    return (dirs && dirs.length > 0) ?
            <TreeView
                className={classes.root}
                defaultCollapseIcon={<ExpandMoreIcon />}
                defaultExpandIcon={<ChevronRightIcon />}
                defaultExpanded={['root', ...Array(dirs?.length).keys()].map(i => i.toString())}
                onNodeToggle={handleToggle}
                ref={newRef => setTreeViewRef(newRef)}
            >
                {treeData && renderTree(treeData, currImg, callback)}
            </TreeView>
        : <CircularProgress />
};

export default Directories;