import Grid from '@material-ui/core/Grid';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';
import React, { useState } from 'react';
import Directories from './components/Directories/Directories';
import Images from './components/Images/Images';
import './splitPane.css';

export const Context = React.createContext<{ currImg: string, setCurrImg: Function }>({ currImg: '', setCurrImg: () => { } });

const App: React.FC = () => {
  const [currImage, setCurrImage] = useState<string>('');
  const [removeImg, setRemoveImg] = useState<boolean>();
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleClose = (_?: React.SyntheticEvent, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  const showError = (err: string) => {
    setError(err);
    setOpen(true);
  }

  return (
    <div className="App">
      <Context.Provider value={{ currImg: currImage, setCurrImg: setCurrImage }}>
        <Grid container spacing={3} style={{ height: '100%', width: '100%', marginTop: 0 }}>
          <Grid item xs={9} style={{ height: '100%', width: '100%' }}>
            <Images removeImg={removeImg} showError={showError} />
          </Grid>
          <Grid item xs={3} style={{ height: '100%', width: '100%', borderLeft: '1px solid rgba(219, 223, 231, 0.5)' }}>
            <Directories setRemoveImg={() => setRemoveImg(prev => !prev)} showError={showError} />
          </Grid>
        </Grid>
        <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
          <Alert onClose={handleClose} severity="error" variant="filled">
            {error}
          </Alert>
        </Snackbar>
      </Context.Provider>
    </div>
  );
}

export default App;
