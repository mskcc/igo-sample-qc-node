import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Avatar,
  AppBar,
  Toolbar,
  Button,
  Typography,
  withStyles,
} from '@material-ui/core';
import Feedback from './Feedback/Feedback';
import image from './igo.png';

const Header = ({ classes, loggedIn, role, submitFeedback }) => {
  const [values, setValues] = React.useState({
    show: false,
  });

  const handleShow = () => {
    setValues({
      show: !values.show,
    });
  };
  // <div className={classes.mskccHeader}>
  return (
    <AppBar position="static" title={image} className={classes.header}>
      <Toolbar>
        <Avatar alt="mskcc logo" src={image} className={classes.avatar} />

        <Typography color="inherit" variant="h6" className={classes.title}>
          Sample QC
        </Typography>
        {loggedIn ? (
          <React.Fragment>
            <Button>
              <NavLink
                to="/"
                activeClassName={classes.active}
                className={classes.navlink}
              >
                <Typography color="inherit" variant="h6">
                  Home
                </Typography>
              </NavLink>
            </Button>
            <Button>
              <NavLink
                to="/pending"
                activeClassName={classes.active}
                className={classes.navlink}
              >
                <Typography color="inherit" variant="h6">
                  Pending
                </Typography>
              </NavLink>
            </Button>

            <Button>
              <NavLink
                to="/instructions"
                activeClassName={classes.active}
                className={classes.navlink}
              >
                <Typography color="inherit" variant="h6">
                  Instructions
                </Typography>
              </NavLink>
            </Button>
            <Button>
              <NavLink
                to="/logout"
                activeClassName={classes.active}
                className={classes.navlink}
              >
                <Typography color="inherit" variant="h6">
                  Logout
                </Typography>
              </NavLink>
            </Button>

            <Typography
              color="inherit"
              variant="h6"
              className={classes.feedback}
            >
              <Button onClick={handleShow}>Feedback</Button>
            </Typography>
            {values.show && (
              <Feedback
                handleShow={handleShow}
                submitFeedback={submitFeedback}
              />
            )}
          </React.Fragment>
        ) : (
          <Button>
            <NavLink
              to="/login"
              activeClassName={classes.active}
              className={classes.navlink}
            >
              <Typography color="inherit" variant="h6">
                Login
              </Typography>
            </NavLink>
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
  // </div>
};

const styles = (theme) => ({
  header: {
    backgroundColor: theme.palette.primary.logo,
    color: 'white',
    textAlign: 'center',
    gridArea: 'header',
  },
  avatar: {
    width: '26px',
    height: '30px',
    padding: '10px',
  },
  title: {
    marginRight: theme.spacing(3),
  },

  navlink: {
    color: theme.palette.textSecondary,
    textDecoration: 'none',
    marginRight: theme.spacing(1),
  },
  active: {
    color: 'white',
    fontSize: '1em',
  },
  feedback: {
    flex: 1,
    color: 'white',
    textAlign: 'right',
    justifyContent: 'flex-end',
  },
});

export default withStyles(styles)(Header);
