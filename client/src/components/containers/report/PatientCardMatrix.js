import React, { Component } from "react";
import { Grid, Card, Label, Container } from "semantic-ui-react";
import { IndividualReportPopup } from "components/containers/popup";
import "./PatientCardMatrix.css";

const COLUMN_COUNT = 5;
const CATEGORY_ARR = ["categoryOne", "categoryTwo", "categoryThree"];

class PatientCardMatrix extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isReportOpen: false,
      selectedPatient: {}
    };
    this._renderPatientCard = this._renderPatientCard.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
  }

  toggleModal(patient) {
    this.setState({
      isReportOpen: !this.state.isReportOpen,
      selectedPatient: patient
    });
  }

  _getDiagnosis(diagnosis) {
    return diagnosis.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  _segmentToChunk(array, size) {
    const chunked_arr = [];
    for (let i = 0; i < array.length; i++) {
      const last = chunked_arr[chunked_arr.length - 1];
      if (!last || last.length === size) {
        chunked_arr.push([array[i]]);
      } else {
        last.push(array[i]);
      }
    }
    return chunked_arr;
  }

  _renderPatientCard(patient) {
    const recordData = patient.recordDatas[0];
    const cssClassName = CATEGORY_ARR[recordData.diagnosisCategory - 1];
    return (
      <Card className="patientCard" key={ patient.patientId } onClick={() => this.toggleModal(patient)} >
        <Card.Content >
          <Card.Header className="patientCardHeader">{patient.patientName}</Card.Header>
          <Card.Meta className="patientCardMetaData">
            <span>{patient.patientId}</span>
          </Card.Meta>
          <Card.Description className="patientCardDescription">
            <Label className={`patientCategoryLabel ${cssClassName}`} empty circular />
            <p className="patientDiagnosis">{this._getDiagnosis(recordData.diagnosisName)}</p>
          </Card.Description>
        </Card.Content>
      </Card>
    );
  }

  _generatePatientRow(patients) {
    const row = patients.map((patient) => {
      return this._renderPatientCard(patient);
    });
    return row;
  }

  _generatePatientMatrix(patientsList) {
    if (patientsList.length !== 0) {
      const subArrays = this._segmentToChunk(patientsList, COLUMN_COUNT);
      const rows = subArrays.map((subArray) => this._generatePatientRow(subArray));
      return rows;
    }
  }

  render() {
    const { patients } = this.props;
    const { isReportOpen, selectedPatient } = this.state;
    return (
      <Container className="patientCardMatrixContainer">
        <Grid className="patientCardGrid non-printable" columns={COLUMN_COUNT}>
          {this._generatePatientMatrix(patients)}
        </Grid>
        {isReportOpen ?
          <IndividualReportPopup
            isOpen={ isReportOpen }
            popupInfo={ selectedPatient }
            onClose={ this.toggleModal }
          />
          : null
        }
      </Container>
    );
  }
}

export default PatientCardMatrix;