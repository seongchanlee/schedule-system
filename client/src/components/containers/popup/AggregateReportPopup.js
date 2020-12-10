import React, { Component } from "react";
import { Button, Header, Modal, Container, Form, Grid } from "semantic-ui-react";
import { YearInput } from "semantic-ui-calendar-react";
import { AggregateReportStatistics } from "components/containers/report";
import { PrintReport } from "components/containers/printTemplate";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import moment from "moment";
import "./AggregateReportPopup.css";

moment.locale("en");
const CATEGORY_ARR = ["I", "II", "III"];

// Requires set of series and yAxis values
const defaultChartOptions = point => {
  return {
    chart: { type: "column" },
    title: { text: "" },
    subtitle: { text: "" },
    xAxis: { categories: ["PT", "PTRA", "OT", "OTRA", "SLP", "SLPA"], crosshair: true},
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


class AggregateReportPopup extends Component {
  _isMounted = false;
  aggregateReportStatistics;

  constructor(props) {
    super(props);
    this.aggregateReportStatistics = new AggregateReportStatistics(this.props.categorySummary);
    this.state = {
      fiscalDate: moment()
    };

    this._handleFilterDateChange = this._handleFilterDateChange.bind(this);
    this._renderAggregateSummaryHeader = this._renderAggregateSummaryHeader.bind(this);
    this._renderStastics = this._renderStastics.bind(this);
    this._renderDateFilter = this._renderDateFilter.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
    delete this.aggregateReportStatistics;
  }

  _print() {
    window.print(window);
  }

  _handleFilterDateChange(event, { value }) {
    this.setState({
      fiscalDate: moment().year(value).month("April").date(1)
    });
  }

  _renderButtons() {
    return(
      <Modal.Actions className="aggReportModalActionContainer non-printable">
        <Button primary onClick={ this._print }>Print</Button>
        <Button  onClick={ this.props.onClose }>Close</Button>
      </Modal.Actions>
    )
  }

  _renderDateFilter() {
    const { fiscalDate } = this.state;
    let fiscalDates = this._calculateFiscalDates(fiscalDate);
    let yearValue = moment(fiscalDates.start).format("YYYY");
    return(
      <Form className="aggReportFormContainer">
        <Form.Field className="aggReportFormField">
          <label className="aggReportFilterLabel">Select Fiscal Year</label>
          <YearInput
            readOnly
            className="aggReportYearInput"
            icon={false}
            dateFormat="YYYY"
            name="date"
            value={ yearValue }
            onChange={ this._handleFilterDateChange }
          />
        </Form.Field>
      </Form>
    );
  }

  _renderAggregateSummaryHeader() {
    const { selectedCategory } = this.props
    // TODO: better error handling.
    if (selectedCategory < 1) return (<div>NOOOOOO</div>);
    return (
      <Header as='h1' className="summaryHeader">
        {`Category ${CATEGORY_ARR[selectedCategory - 1]} Aggregate Report`}
      </Header>
    );
  }

  _renderStastics(stats) {
    return(
      <Container className="aggReportContentContainer non-printable">
        <Header className="aggReportModalContentHeader">Therapy Intensity Statistics (in Minutes)</Header>
        <Grid className="aggStatisticContainer">
          <Grid.Row className="aggStatisticRow">
            <Grid.Column width={4} className="aggStatisticColumn">
              <p className="aggStatisticValue">{ stats.totalAverage }</p>
              <p className="aggStatisticDescription">Average</p>
            </Grid.Column>

            <Grid.Column width={4} className="aggStatisticColumn">
              <p className="aggStatisticValue">{ stats.totalMedian } </p>
              <p className="aggStatisticDescription">Median</p>
            </Grid.Column>

            <Grid.Column width={4} className="aggStatisticColumn">
              <p className="aggStatisticValue">{ stats.totalMaximum }</p>
              <p className="aggStatisticDescription">Maximum</p>
            </Grid.Column>

            <Grid.Column width={4} className="aggStatisticColumn">
              <p className="aggStatisticValue">{ stats.totalMinimum }</p>
              <p className="aggStatisticDescription">Minimum</p>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
    );
  }

  _renderMedianTherapyIntensityHistogram({medianTherapyIntensityByDisciplines}) {
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
    const chartOptions = Object.assign({...defaultChartOptions("minutes")}, {...series}, {...yAxis});

    return (
      <Container className="aggReportContentContainer non-printable">
        <Header className="aggReportModalContentHeader">Median Therapy Intensity by Disciplines</Header>
        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
      </Container>
    );
  }

  _renderMedianNumberOfAttendedByDisciplines({ medianNumberOfAttendedByDisciplines }) {
    const series = {
      series: [{
        showInLegend: false,
        data: [
          medianNumberOfAttendedByDisciplines[0], //PT
          medianNumberOfAttendedByDisciplines[1], //PTRA
          medianNumberOfAttendedByDisciplines[2], // OT
          medianNumberOfAttendedByDisciplines[3], // OTRA
          medianNumberOfAttendedByDisciplines[4], // SLP
          medianNumberOfAttendedByDisciplines[5]  // SLPA
        ]
      }]
    };

    const yAxis = { yAxis: { min: 0, tickInterval: 1, title: { text: "Number of Sessions" } } };
    const chartOptions = Object.assign({...defaultChartOptions("times")}, {...series}, {...yAxis});

    return (
      <Container className="aggReportContentContainer non-printable">
        <Header className="aggReportModalContentHeader">Median Number of Sessions Attended by Disciplines</Header>
        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
      </Container>
    );
  }

  _renderMedianNumberOfMissedByDisciplines({ medianNumberOfMissedByDisciplines }) {
    const series = {
      series: [{
        showInLegend: false,
        data: [
          medianNumberOfMissedByDisciplines[0], //PT
          medianNumberOfMissedByDisciplines[1], //PTRA
          medianNumberOfMissedByDisciplines[2], // OT
          medianNumberOfMissedByDisciplines[3], // OTRA
          medianNumberOfMissedByDisciplines[4], // SLP
          medianNumberOfMissedByDisciplines[5]  // SLPA
        ]
      }]
    };
    const yAxis = { yAxis: { min: 0, tickInterval: 1, title: { text: "Number of Sessions" } } };
    const chartOptions = Object.assign({...defaultChartOptions("times")}, {...series}, {...yAxis});
    return (
      <Container className="aggReportContentContainer non-printable">
        <Header className="aggReportModalContentHeader">Median Number of Sessions Missed by Disciplines</Header>
        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
      </Container>
    );
  }

  _calculateFiscalDates(date) {
    let year = moment(date).year();
    let start = moment().year(year).month("April").date(1);
    let end = moment().year(year).month("March").date(31);

    if (moment(date).quarter() === 1) {
      start.subtract(1, "y");
    } else {
      end.add(1, "y");
    }

    return {
      start: start.format("YYYY-MM-DD"),
      end: end.format("YYYY-MM-DD")
    };
  }

  render() {
    const { fiscalDate } = this.state;
    let fiscalDates = this._calculateFiscalDates(fiscalDate);
    const stats = this.aggregateReportStatistics.retrieveStatistics(fiscalDates.start, fiscalDates.end);

    return (
      <div>
        <Modal className="aggReportModalContainer non-printable" onClose={ this.props.onClose } open={ this.props.isOpen }>
          <Modal.Header className="aggModalHeaderContainer non-printable">
            <Grid>
              <Grid.Row>
                <Grid.Column width={13}>
                  { this._renderAggregateSummaryHeader() }
                </Grid.Column>
                <Grid.Column width={3}>
                  { this._renderDateFilter() }
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Modal.Header>
          <Modal.Content className="aggModalContentContainer" scrolling>
            { this._renderStastics(stats) }
            { this._renderMedianTherapyIntensityHistogram(stats) }
            { this._renderMedianNumberOfAttendedByDisciplines(stats) }
            { this._renderMedianNumberOfMissedByDisciplines(stats) }
          </Modal.Content>
          { this._renderButtons() }
        </Modal>
        <PrintReport
          stats={ stats }
          filterStartDate={ fiscalDates.start }
          filterEndDate={ fiscalDates.end }
          selectedCategory={ this.props.selectedCategory }
        />
      </div>
    );
  }
}

export default AggregateReportPopup;