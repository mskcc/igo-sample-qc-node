import React from 'react';
import { HotTable } from '@handsontable/react';
import { withStyles } from '@material-ui/core/styles';
import Swal from 'sweetalert2';

const styles = (theme) => ({
  container: {
    width: '100%',
    overflowX: 'auto',
    display: 'grid',
    maxHeight: '515px'
  },

});

class Table extends React.Component {
  constructor(props) {
    super(props);
    this.hotTableComponent = React.createRef();
  }
  state = {
    hiddenColumns: []
  };
  componentDidMount = () => {
    let isLabMember = this.props.role === 'lab_member';
    if (
      this.hotTableComponent !== undefined &&
      this.hotTableComponent.current !== undefined &&
      this.hotTableComponent.current.hotInstance !== undefined
    ) {
      let data = this.hotTableComponent.current.hotInstance.getData();
      this.hotTableComponent.current.hotInstance.updateSettings({
        cells: function (row, col) {
          var cellProperties = {};

          if (
            // lab members never get to make decisions
            isLabMember ||
            data[row][col] === 'Submit new iLab request' ||
            data[row][col] === 'Already moved forward by IGO'
          ) {
            cellProperties.readOnly = true;
          }
          return cellProperties;
        },
      });
    }
    
    const cellCountCol = this.props.data.columnFeatures.length - 5;
    const cellViabilityCol = this.props.data.columnFeatures.length - 4;
    const tissueSizeCol = this.props.data.columnFeatures.length - 3;
    const maxReadsCol = this.props.data.columnFeatures.length - 2;
    const recordIdCol = this.props.data.columnFeatures.length - 1;
    // if not investigator prepped project, hide max number of reads column
    const columnHeader = this.hotTableComponent.current.hotInstance.getColHeader(maxReadsCol);
    if(!this.props.investigatorPrepped && columnHeader === 'Number of Reads') {
      this.setState({ 
        hiddenColumns: [recordIdCol, maxReadsCol]
      });
    } else if (!this.props.cellInfo && (columnHeader == 'Cell Count' || columnHeader == 'Cell Viability' || columnHeader == 'Tissue Size')) {
      this.setState({
        hiddenColumns: [recordIdCol, tissueSizeCol, cellViabilityCol, cellCountCol]
      })
    } else {
      this.setState({ 
        hiddenColumns: [recordIdCol]
      });
    }
  };

  showError = (error) => {
    Swal.fire(error);
  };

  render() {
    const { classes } = this.props;
    // last column is always RecordId. Needed to set investigator decision efficiently
    // let lastColumnIndex = this.props.data.columnFeatures.length - 1;
    let isAttachmentTable = this.props.data.columnHeaders.length === 3;
    let isPathologyTable =
      (this.props.data.columnHeaders.length > 3) &
      (this.props.data.columnHeaders.length < 6);
    return (
      <div className={classes.container}>
        <HotTable
          licenseKey="non-commercial-and-evaluation"
          id="hot"
          className={classes.reportTable}
          ref={this.hotTableComponent}
          data={this.props.data.data}
          columns={this.props.data.columnFeatures}
          colHeaders={this.props.data.columnHeaders}
          hiddenColumns={{
            columns: this.state.hiddenColumns,
            indicators: false,
          }}
          rowHeaders={true}
          stretchH={isAttachmentTable || isPathologyTable ? 'none' : 'all'}
          // columnSorting={
          //   isAttachmentTable
          //     ? {
          //         initialConfig: {
          //           column: 1,
          //           sortOrder: "asc"
          //         }
          //       }
          //     : {}
          // }
          height='40vh'
          columnSorting="true"
          manualColumnResize={true}
          modifyColWidth={function (width, col) {
            if (width > 500) {
              return 500;
            }
          }}
          rowHeights="35"
          // afterOnCellMouseDown={(event, coords, TD) => {
          //   if (isAttachmentTable && event.button === 0 && coords.row > -1) {
          //     if (coords.col === 1) {
          //       this.props.handleAttachmentDownload(
          //         TD.firstElementChild.getAttribute('record-id'),
          //         TD.firstElementChild.getAttribute('file-name')
          //       );
          //     }
          //   }
          // }}
        />
      </div>
    );
  }
}

export default withStyles(styles)(Table);
