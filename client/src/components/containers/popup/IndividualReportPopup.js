import React, { Component } from "react";
import { Button, Header, Modal, Container, Grid, Form, Label, Table } from "semantic-ui-react";
import { DateInput } from "semantic-ui-calendar-react";
import { IndividualReportStatistics } from "components/containers/report";
import { PrintReport } from "components/containers/printTemplate";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import moment from "moment";
import "./IndividualReportPopup.css";


moment.locale("en");
const REPORT_CONST = {
  DIAGNOSIS_NAME: "diagnosisName",
  DIAGNOSIS_CATEGORY: "diagnosisCategory"
};

// TODO: can refactor later
// Requires set of series and yAxis values
const defaultChartOptions = point => {
  return {
    chart: { type: "column" },
    title: { text: "" },
    subtitle: { text: "" },
    xAxis: { categories: ["PT", "PTRA", "OT", "OTRA", "SLP", "SLPA"], crosshair: true },
    tooltip: {
      headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
      pointFormat: `<tr><td style="color:{series.color};padding:0">{series.name}: </td><td style="padding:0"><b>{point.y:.f} ${point}</b></td></tr>`,
      footerFormat: "</table>",
      shared: true,
      useHTML: true
    },
    plotOptions: { column: { pointPadding: 0.2, borderWidth: 0 } },
    credits: {
      enabled: false
    }
  };
}


class IndividualReportPopup extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);
    const recordData = props.popupInfo.recordDatas[0];
    const filterEndDate = recordData.dischargeDate ?
      moment(recordData.dischargeDate, "YYYY-MM-DD").format("YYYY-MM-DD") :
      moment().format("YYYY-MM-DD");

    this.individualReportStatistics = new IndividualReportStatistics(recordData.appointments);

    this.state = {
      printView: false,
      filterStartDate: moment(recordData.admissionDate, "YYYY-MM-DD").format("YYYY-MM-DD"),
      filterEndDate: filterEndDate
    };

    this.handlePrintState = this.handlePrintState.bind(this);
    this._handleFilterDateChange = this._handleFilterDateChange.bind(this);
    this._renderStastics = this._renderStastics.bind(this);
    this._renderDateFilter = this._renderDateFilter.bind(this);
    this._renderButtons = this._renderButtons.bind(this);
    this._renderTherapyIntensityHistogram = this._renderTherapyIntensityHistogram.bind(this);
    this._renderDidAttendHistogram = this._renderDidAttendHistogram.bind(this);
    this._renderDidNotAttendHistogram = this._renderDidNotAttendHistogram.bind(this);
    this._renderSupportStaffList = this._renderSupportStaffList.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
    delete this.individualReportStatistics;
  }

  _print() {
    window.print(window);
  }

  handlePrintState() {
    this.setState({printView: !this.state.printView});
  }

  _handleFilterDateChange(event, { value }, key) {
    const chosenDate = moment(value, "YYYY-MM-DD").format("YYYY-MM-DD");
    this.setState({
      [key]: chosenDate,
    });
  }

  _capitalizeDiagnosis(diagnosis) {
    return diagnosis.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }

  _returnCategory(recordData, category) {
    return recordData[category];
  }

  _renderButtons() {
    return(
      <Modal.Actions className="individualReportActionContainer non-printable ">
        <Button primary className="btn_pu" onClick={ this._print }>Print</Button>
        <Button className="btn_pu" onClick={ this.props.onClose }>Close</Button>
      </Modal.Actions>
    )
  }

  _renderPatientSummaryHeader(popupInfo) {
    const recordData = popupInfo.recordDatas[0];
    return (
      <Container className="patientSummaryContainer">
        <Grid className="patientSummary">
          <Grid.Row className="patientDetailContainer">
            <Grid.Column width={16}>
              <Header as="h1" className="patientSummaryPatientName">{popupInfo.patientName}</Header>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row className="patientDetailContainer">
            <Grid.Column width={3} className="patientDetailDescription">MRN</Grid.Column>
            <Grid.Column width={13} className="patientDetailValue">{popupInfo.patientId}</Grid.Column>
          </Grid.Row>

          <Grid.Row className="patientDetailContainer">
            <Grid.Column width={3} className="patientDetailDescription">Category</Grid.Column>
            <Grid.Column width={13} className="patientDetailValue">
              {recordData[REPORT_CONST.DIAGNOSIS_CATEGORY]}
            </Grid.Column>
          </Grid.Row>

          <Grid.Row className="patientDetailContainer">
            <Grid.Column width={3} className="patientDetailDescription">Diagnosis</Grid.Column>
            <Grid.Column width={13} className="patientDetailValue">
              {this._capitalizeDiagnosis(recordData[REPORT_CONST.DIAGNOSIS_NAME])}
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
    );
  }

  _renderDateFilter() {
    const { filterStartDate, filterEndDate } = this.state;
    const { admissionDate } = this.props.popupInfo.recordDatas[0];
    const isTimeValid = moment(filterStartDate, "YYYY-MM-DD").isBefore(moment(filterEndDate, "YYYY-MM-DD"));
    return (
      <Form className="patientStatDateContainer">
        <Form.Group>
          <Form.Input className="patientStatFormInput" error={!isTimeValid}>
            <label className="patientStatDateLabel">Start Date</label>
            <DateInput
              readOnly
              icon={false}
              className="patientStateDateInput patientStatStartDate"
              dateFormat="YYYY-MM-DD"
              name="date"
              placeholder="Date"
              minDate={moment(admissionDate, "YYYY-MM-DD").format("YYYY-MM-DD")}
              value={moment(filterStartDate, "YYYY-MM-DD").format("YYYY-MM-DD")}
              onChange={(e, data) => this._handleFilterDateChange(e, data, "filterStartDate")}
            />
            {!isTimeValid ?
              <Label basic color='red' pointing>Start time must be before end time</Label>
              : null
            }
          </Form.Input>
          <label className="statDateSeparator">-</label>
          <Form.Input className="patientStatFormInput" error={!isTimeValid}>
            <label className="patientStatDateLabel">End Date</label>
            <DateInput
              readOnly
              icon={false}
              className="patientStateDateInput patientStatEndDate"
              dateFormat="YYYY-MM-DD"
              name="date"
              placeholder="Date"
              value={moment(filterEndDate, "YYYY-MM-DD").format("YYYY-MM-DD")}
              onChange={(e, data) => this._handleFilterDateChange(e, data, "filterEndDate")}
            />
            {!isTimeValid ?
              <Label basic color='red' pointing>End time must be after start time</Label>
              : null
            }
          </Form.Input>
        </Form.Group>
      </Form>
    );
  }

  _renderStastics(stats) {
    return(
      <Container className="patientReportContentContainer non-printable">
        <Header className="patientReportModalContentHeader">
          Therapy Intensity Statistics (in Minutes)
        </Header>
        <Grid className="patientStatisticContainer">
          <Grid.Row className="patientStatisticRow">
            <Grid.Column width={4} className="patientStatisticColumn">
              <p className="patientStatisticValue">{stats.totalAverage}</p>
              <p className="patientStatisticDescription">Average</p>
            </Grid.Column>

            <Grid.Column width={4} className="patientStatisticColumn">
              <p className="patientStatisticValue">{stats.totalMedian} </p>
              <p className="patientStatisticDescription">Median</p>
            </Grid.Column>

            <Grid.Column width={4} className="patientStatisticColumn">
              <p className="patientStatisticValue">{stats.totalMaximum}</p>
              <p className="patientStatisticDescription">Maximum</p>
            </Grid.Column>

            <Grid.Column width={4} className="patientStatisticColumn">
              <p className="patientStatisticValue">{stats.totalMinimum}</p>
              <p className="patientStatisticDescription">Minimum</p>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
    );
  }

  _renderTherapyIntensityHistogram({ medianTherapyIntensityByDisciplines }) {
    const series = {
      series: [{
        showInLegend: false,
        data: [
          medianTherapyIntensityByDisciplines[0], //PT
          medianTherapyIntensityByDisciplines[1], //PTRA
          medianTherapyIntensityByDisciplines[2], // OT
          medianTherapyIntensityByDisciplines[3], // OTRA
          medianTherapyIntensityByDisciplines[4], // SLP
          medianTherapyIntensityByDisciplines[5]  // SLPA
        ]
      }]
    };
    const yAxis = { yAxis: { min: 0, title: { text: "Minutes" } } };
    const chartOptions = Object.assign({ ...defaultChartOptions("minutes") }, { ...series }, { ...yAxis });
    return (
      <Container className="patientReportContentContainer non-printable">
        <Header className="patientReportModalContentHeader">Median Therapy Intensity by Disciplines</Header>
        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
      </Container>
    );
  }

  _renderDidAttendHistogram({ numberOfAttendedByDisciplines }) {
    const series = {
      series: [{
        showInLegend: false,
        data: [
          numberOfAttendedByDisciplines[0], //PT
          numberOfAttendedByDisciplines[1], //PTRA
          numberOfAttendedByDisciplines[2], // OT
          numberOfAttendedByDisciplines[3], // OTRA
          numberOfAttendedByDisciplines[4], // SLP
          numberOfAttendedByDisciplines[5]  // SLPA
        ]
      }]
    };

    const yAxis = { yAxis: { min: 0, tickInterval: 1, title: { text: "Number of Sessions" } } };
    const chartOptions = Object.assign({ ...defaultChartOptions("times") }, { ...series }, { ...yAxis });
    return (
      <Container className="patientReportContentContainer non-printable">
        <Header className="patientReportModalContentHeader">Number of Sessions Attended by Disciplines</Header>
        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
      </Container>
    );
  }

  _renderDidNotAttendHistogram({ numberOfMissedByDisciplines }) {
    const series = {
      series: [{
        showInLegend: false,
        data: [
          numberOfMissedByDisciplines[0], //PT
          numberOfMissedByDisciplines[1], //PTRA
          numberOfMissedByDisciplines[2], // OT
          numberOfMissedByDisciplines[3], // OTRA
          numberOfMissedByDisciplines[4], // SLP
          numberOfMissedByDisciplines[5]  // SLPA
        ]
      }]
    };
    const yAxis = { yAxis: { min: 0, tickInterval: 1, title: { text: "Number of Sessions" } } };
    const chartOptions = Object.assign({ ...defaultChartOptions("times") }, { ...series }, { ...yAxis });
    return (
      <Container className="patientReportContentContainer non-printable">
        <Header className="patientReportModalContentHeader">Number of Sessions Missed by Disciplines</Header>
        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
      </Container>
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

  _renderSupportStaffList({ staffNameTypeMap }) {
    return (
      <Container className="patientReportContentContainer non-printable">
        <Header className="patientReportModalContentHeader">Support Personnel List</Header>
        <Table celled columns={2}>
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
      </Container>
    );
  }

  render() {
    const { popupInfo, isOpen, onClose } = this.props;
    const { filterStartDate, filterEndDate, printView } = this.state;
    const stats = this.individualReportStatistics.retrieveStatistics(filterStartDate, filterEndDate);
    return (
      <div>
        <Modal className="individualReportContainer non-printable" onClose={ onClose } open={ isOpen }>
          <Modal.Header className="patientStatModalHeader non-printable">
            <Grid>
              <Grid.Row className="patientStatModalRow">
                <Grid.Column width={10} className="patientStatModalColumn">
                  {this._renderPatientSummaryHeader(popupInfo)}
                </Grid.Column>
                <Grid.Column width={6} className="statDateFilterColumn patientStatModalColumn">
                  {this._renderDateFilter()}
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Modal.Header>
          <Modal.Content className="patientContentContainer" scrolling>
            {this._renderStastics(stats)}
            {this._renderTherapyIntensityHistogram(stats)}
            {this._renderDidAttendHistogram(stats)}
            {this._renderDidNotAttendHistogram(stats)}
            {this._renderSupportStaffList(stats)}
          </Modal.Content>
          {this._renderButtons()}
        </Modal>
        <PrintReport
          stats={ stats }
          patientInfo={ popupInfo }
          filterStartDate={ filterStartDate }
          filterEndDate={ filterEndDate }
        />
      </div>
    );
  }
}

export default IndividualReportPopup;