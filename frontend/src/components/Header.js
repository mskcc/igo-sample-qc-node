import React from 'react';
import { NavLink } from 'react-router-dom';
import { Config } from '../secret_config';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import {
  Avatar,
  AppBar,
  Toolbar,
  Button,
  Typography,
} from '@material-ui/core';
import image from '../igo.png';

const Header = (props) => {
  const [values, setValues] = React.useState({ requestId: '' });

  const handleChange = (requestId) => (event) => {
    setValues({ ...values, [requestId]: event.target.value });
  };

  const handleSearch = () => {
    const request = values.requestId.toUpperCase().trim();
    window.location.assign(`${Config.APP_ROOT}${Config.BASENAME}/request/${request}`);
    // props.history.push('/request/' + request);
    // props.getRequest(request);
  };

  return (
    <AppBar position="static" title={image} className={'header'}>
      <Toolbar>
        <Avatar alt="mskcc logo" src={image} className={'avatar'} />

        <Typography color="inherit" variant="h6" className={'title'}>
          Sample QC
        </Typography>
          <React.Fragment>
            <Button>
              <NavLink
                to="/pending"
                activeClassName={'active'}
                className={'navlink'}
              >
                <Typography color="inherit" variant="h6">
                  Pending
                </Typography>
              </NavLink>
            </Button>

            <Button>
              <NavLink
                to="/instructions"
                activeClassName={'active'}
                className={'navlink'}
              >
                <Typography color="inherit" variant="h6">
                  Instructions
                </Typography>
              </NavLink>
            </Button>

            <Button>
              <a
                href="https://genomics.mskcc.org/criteria/dna"
                className={'navlink'}
                target="_blank"
              >
                <Typography color="inherit" variant="h6">
                  Pass/Fail Criteria
                </Typography>
              </a>
            </Button>

            <Paper className={'search'}>
              <InputBase
                className={'textField'}
                id="outlined-requestId"
                value={values.requestId}
                placeholder="Request ID"
                onChange={handleChange('requestId')}
                onKeyPress={(event) => {
                  if (event.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
              <IconButton
                className={'iconButton'}
                onClick={handleSearch}
                aria-label="search"
                disabled={!values.requestId.length > 0}
              >
                <SearchIcon />
              </IconButton>
            </Paper>
          </React.Fragment>
      </Toolbar>
    </AppBar>
  );
  // </div>
};


export default Header;
