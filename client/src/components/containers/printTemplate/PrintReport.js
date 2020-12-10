import React from 'react';
import { Table } from "semantic-ui-react";
import "./PrintReport.css";

class PrintReport extends React.Component {
  renderPatientReport(stats, patientInfo, filterStartDate, filterEndDate) {
    const { medianTherapyIntensityByDisciplines,
      numberOfAttendedByDisciplines, numberOfMissedByDisciplines } = stats;
    return(
      <div className="printReportTableContainer">
        { this.renderPatientInfo(patientInfo, filterStartDate, filterEndDate) }
        { this.renderTherapyIntensityStatisticInMin(stats) }
        { this.renderTherapyTable(medianTherapyIntensityByDisciplines, "Median Therapy Intensity by Disciplines in minutes") }
        { this.renderTherapyTable(numberOfAttendedByDisciplines, "Number of Sessions Attended by Disciplines") }
        { this.renderTherapyTable(numberOfMissedByDisciplines, "Number of Sessions Missed by Disciplines") }
        <div className="pagebreak"></div>
        { this.renderSupportStaffList(stats) }
      </div>
    );
  }

  renderReport(stats, patientInfo, filterStartDate, filterEndDate, selectedCategory) {
    if (!!patientInfo) {
      return this.renderPatientReport(stats, patientInfo, filterStartDate, filterEndDate);
    } else {
      return this.renderAggregateReport(stats, selectedCategory, filterStartDate, filterEndDate);
    }
  }

  renderAggregateReport(stats, selectedCategory, filterStartDate, filterEndDate) {
    const { medianTherapyIntensityByDisciplines,
      medianNumberOfAttendedByDisciplines, medianNumberOfMissedByDisciplines} = stats;

    return(
      <div className="printReportTableContainer">
        <div className="printReportTableDiv">
          <p className="printReportTableTitle categoryName">
            {`Category ${selectedCategory} Aggregate Report`}
          </p>
        </div>
        { this.renderAggregateHeaderTable(selectedCategory, filterStartDate, filterEndDate) }
        { this.renderTherapyIntensityStatisticInMin(stats) }
        { this.renderTherapyTable(medianTherapyIntensityByDisciplines, "Median Therapy Intensity by Disciplines in minutes") }
        { this.renderTherapyTable(medianNumberOfAttendedByDisciplines, "Median Number of Sessions Attended by Disciplines") }
        { this.renderTherapyTable(medianNumberOfMissedByDisciplines, "Median Number of Sessions Missed by Disciplines") }
      </div>
    );
  }

  renderAggregateHeaderTable(selectedCategory, filterStartDate, filterEndDate) {
    return(
      <div className="printReportTableDiv">
        <Table columns={2} celled className="printReportTable">
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Filter Start Date</Table.HeaderCell>
              <Table.HeaderCell>Filter End Date</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>{ filterStartDate }</Table.Cell>
              <Table.Cell>{ filterEndDate }</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </div>
    );
  }

  renderTherapyTable(arr, title) {
    return (
      <div className="printReportTableDiv">
        <p className="printReportTableTitle">{title}</p>
        <Table columns={6} celled className="printReportTable">
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>PT</Table.HeaderCell>
              <Table.HeaderCell>PTRA</Table.HeaderCell>
              <Table.HeaderCell>OT</Table.HeaderCell>
              <Table.HeaderCell>OTRA</Table.HeaderCell>
              <Table.HeaderCell>SLP</Table.HeaderCell>
              <Table.HeaderCell>SLPA</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>{arr[0]}</Table.Cell>
              <Table.Cell>{arr[1]}</Table.Cell>
              <Table.Cell>{arr[2]}</Table.Cell>
              <Table.Cell>{arr[3]}</Table.Cell>
              <Table.Cell>{arr[4]}</Table.Cell>
              <Table.Cell>{arr[5]}</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </div>
    );
  }

  renderTherapyIntensityStatisticInMin(stats) {
    return(
      <div className="printReportTableDiv">
        <p className="printReportTableTitle">Therapy Intensity Statistics (in Minutes)</p>
        <Table columns={4} celled className="printReportTable">
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Total Average</Table.HeaderCell>
              <Table.HeaderCell>Total Median</Table.HeaderCell>
              <Table.HeaderCell>Total Minimum</Table.HeaderCell>
              <Table.HeaderCell>Total Maximum</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>{stats.totalAverage}</Table.Cell>
              <Table.Cell>{stats.totalMedian}</Table.Cell>
              <Table.Cell>{stats.totalMinimum}</Table.Cell>
              <Table.Cell>{stats.totalMaximum}</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </div>
    );
  }

  renderPatientInfo({patientName, patientId, recordDatas}, filterStartDate, filterEndDate) {
    return(
      <div className="printReportTableDiv">
        <p className="printReportTableTitle patientName">{ `Patient: ${patientName}` }</p>
        <Table columns={5} celled className="printReportTable">
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>MRN</Table.HeaderCell>
              <Table.HeaderCell>Patient Category</Table.HeaderCell>
              <Table.HeaderCell>Diagnosis</Table.HeaderCell>
              <Table.HeaderCell>Filter Start Date</Table.HeaderCell>
              <Table.HeaderCell>Filter End Date</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>{ patientId }</Table.Cell>
              <Table.Cell>{ recordDatas[0]["diagnosisCategory"] }</Table.Cell>
              <Table.Cell>{ recordDatas[0]["diagnosisName"] }</Table.Cell>
              <Table.Cell>{ filterStartDate }</Table.Cell>
              <Table.Cell>{ filterEndDate }</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </div>
    );
  }

  _renderStaffRows(map) {
    let rows = [];
    let keyIdx = 0;
    map.forEach((type, name) => {
      rows.push(
        <Table.Row key={keyIdx ++}>
          <Table.Cell>{name}</Table.Cell>
          <Table.Cell>{type}</Table.Cell>
        </Table.Row>
      )
    });

    return rows;
  }

  renderSupportStaffList({ staffNameTypeMap }) {
    return (
      <div className="printReportTableDiv supportPersonnelListContainer">
        <p className="printReportTableTitle">Support Personnel List</p>
        <Table celled columns={2} className="printReportTable">
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Therapist Name</Table.HeaderCell>
              <Table.HeaderCell>Therapy Type</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {this._renderStaffRows(staffNameTypeMap)}
          </Table.Body>
        </Table>
      </div>
    );
  }

  render() {
    const { stats, patientInfo, filterStartDate, filterEndDate, selectedCategory } = this.props;
    return this.renderReport(stats, patientInfo, filterStartDate, filterEndDate, selectedCategory);
  }
}

export default PrintReport;