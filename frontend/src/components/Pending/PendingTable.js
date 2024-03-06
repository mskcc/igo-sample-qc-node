import React from 'react';
import { HotTable } from '@handsontable/react';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Swal from 'sweetalert2';

const styles = (theme) => ({
  container: {
    width: '90vw',
    overflowX: 'auto',
    margin: '3em auto',
  },
});

class Table extends React.Component {
  constructor(props) {
    super(props);
    this.hotTableComponent = React.createRef();
  }

  showError = (error) => {
    Swal.fire(error);
  };

  render() {
    const { classes } = this.props;
    // last column is always RecordId. Needed to set investigator decision efficiently
    return (
      <div className={classes.container}>
        <Typography variant="h5">Waiting for Investigator Decision</Typography>
        <HotTable
          licenseKey="non-commercial-and-evaluation"
          id="hot"
          ref={this.hotTableComponent}
          data={this.props.data.data}
          columns={this.props.data.columnFeatures}
          colHeaders={this.props.data.columnHeaders}
          rowHeaders={true}
          className="pending"
          filters={true}
          dropdownMenu={['filter_by_value', 'filter_action_bar']}
          columnSorting="true"
          stretchH="all"
          height="80vh"
          afterOnCellMouseDown={(event, coords, TD) => {
            if (event.button === 0 && coords.row > -1) {
              if (coords.col === this.props.data.columnHeaders.length - 1) {
                this.props.showPending(
                  TD.firstElementChild.getAttribute('pending-id')
                );
              }
            }
          }}
        />
      </div>
    );
  }
}

export default withStyles(styles)(Table);
