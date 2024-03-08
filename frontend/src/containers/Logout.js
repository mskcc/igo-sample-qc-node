import React from 'react';
import { connect } from 'react-redux';
import { userActions } from '../redux/actions';
import CircularProgress from '@material-ui/core/CircularProgress';

class Logout extends React.Component {
    componentDidMount() {
        this.props.logout();
    }

    render() {
        return <CircularProgress color='secondary' size={24} />;
    }
}
const mapStateToProps = (state) => ({
    ...state.user,
});
const mapDispatchToProps = {
    ...userActions,
};

export default connect(mapStateToProps, mapDispatchToProps)(Logout);
