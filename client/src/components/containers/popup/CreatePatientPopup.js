import React, { Component } from "react";
import { Label, Modal, Grid, Button, Select, Header, Input,
  Form, Container, Message, Confirm } from "semantic-ui-react";
import { DateInput } from 'semantic-ui-calendar-react';
import * as moment from 'moment';
import { UserAction, CreateUserAction } from 'actions';
import { STATE_CONST } from './CreateUserPopup';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import './CreateUserPopup.css';

const PATIENT_CAT = [
  { key: '1', text: '1', value: '1' },
  { key: '2', text: '2', value: '2' },
  { key: '3', text: '3', value: '3' }
];
const PLACEHOLDER = {
  mrn: '10-digit number',
  type_of_injury: 'ex. stroke',
}

class CreatePatientPopup extends Component {
  constructor(props) {
    super(props);
    this.initialState = {
      isConfirming: false,
      form: {
        User: {
          type: 'Patient',
          first_name: '',
          last_name: '',
          phone_number: '',
          email: '',
          permission_level: 'Low'
        },
        Patient: {
          mrn: '',
          date_of_birth: null,
          address: '',
          is_in_patient: true,
          patient_program: 'PT'
        },
        Admission_record: {
          type_of_injury: '',
          admission_date: null,
          discharge_date: null,
          comment: '',
          patient_category: '1',
        }
      },
      error: {
        mrn: false,
        first_name: false,
        last_name: false,
        phone_number: false,
        date_of_birth: false,
        address: false,
        is_in_patient: false,
        type_of_injury: false,
        admission_date: false,
        patient_category: false
      }
    };
    moment.locale('en');
    this.state = this.initialState;

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.validateField = this.validateField.bind(this);
    this.handlemrnSubmit = this.handlemrnSubmit.bind(this);
    this.handleNewAccountSubmit = this.handleNewAccountSubmit.bind(this);
    this.handleNewAdmissionSubmit = this.handleNewAdmissionSubmit.bind(this);
  }

  handleInputChange(event, key, formtype) {
    const value = event.target && event.target.value;
    this.setState({
      form: {
        ...this.state.form,
        [formtype]: {
          ...this.state.form[formtype],
          [key]: value
        }
      }, error: {
        ...this.state.error,
        [key]: false
      }
    })
  }

  handleDateChange(field, { value }, formtype) {
    if (value.match(/[a-z]/i)) {
      this.setState({
        error: {
          ...this.state.error,
          [field]: true
        }
      })
    } else {
      this.setState({
        form: {
          ...this.state.form,
          [formtype]: {
            ...this.state.form[formtype],
            [field]: moment(new Date(value)).format("YYYY-MM-DD")
          }
        }
        , error: {
          ...this.state.error,
          [field]: false
        }
      })
    }
  }

  handleSelectChange(field, { value }, formtype) {
    if (field === 'is_in_patient') value = !this.state.form.Patient.is_in_patient;
    this.setState({
      form: {
        ...this.state.form,
        [formtype]: {
          ...this.state.form[formtype],
          [field]: value
        }
      }
    })
  }

  handlemrnSubmit() {
    const mrn = this.state.form.Patient['mrn'];
    if (mrn.length === 10 && /^[0-9]+$/i.test(mrn)) {
      this.props.getPatient(mrn);
    } else {
      this.setState({
        error: {
          ...this.state.form.error,
          mrn: true
        }
      });
    }
  }

  handleNewAdmissionSubmit(event) {
    event.preventDefault();
    const admissionFields = ['type_of_injury', 'discharge_date', 'admission_date', 'patient_category'];
    if (!this.validateField(admissionFields))
      return;
    return this.setState({isConfirming: true});
  }

  handleConfirm() {
    if (this.props.exists) {
      const admissionRecord = Object.assign(
        {
          admissionRecord: {
            ...this.state.form.Admission_record,
            patient_id: this.props.patient[0].User.id
          }
        });
      this.props.createAdmissionRecord(admissionRecord);

    } else {
      const { User, Patient, Admission_record } = this.state.form;
      this.props.createPatient({ User, Patient, Admission_record })
        .then(() =>  this.props.getUsers())
        .catch(() => "fail...");
    }
    this.setState({isConfirming: false});
  }

  handleNewAccountSubmit() {
    const { email } = this.state.form.User;
    const fields = ['last_name', 'first_name', 'phone_number', 'mrn', 'date_of_birth', 'address', 'is_in_patient'];
    if (this.validateField(fields) && this.validateEmail()) {
      this.props.nextSlide();
    }

  }

  rendermrnCheck() {
    return (
      <Modal.Content>
        <Form>
          <Form.Field error={this.state.error['mrn']}>
            <label>{STATE_CONST['mrn']}</label>
            <Input maxLength="10" placeholder={PLACEHOLDER['mrn']} onChange={e => this.handleInputChange(e, 'mrn', 'Patient')} />
          </Form.Field>
        </Form>
      </Modal.Content>
    );
  }

  renderNewAdmissionRecord() {
    return (
      <Modal.Content>
        {this.props.error && <Message negative>
          <Message.Header>There has been an error with your submission.</Message.Header>
          <p>Please try again!</p>
        </Message>}
        <Form id="create-user">
          <Header>Admission Record</Header>
          {this.renderFieldHelper(['type_of_injury'], 'Admission_record')}
          {this.renderRepeatDropDownForm()}
          {this.renderDateHelper('admission_date', 'Admission_record')}
          {this.renderDateHelper('discharge_date', 'Admission_record')}
          {this.renderCommentForm('comment', 'Admission_record')}
        </Form>
      </Modal.Content>)
  }

  renderNewAccount() {
    return (
      <Modal.Content image scrolling>
        <Form id="create-user">
          <Header>Basic Information</Header>
          {this.renderFieldHelper(['first_name', 'last_name', 'phone_number', 'email'], 'User')}
          {this.renderFieldHelper(['address'], 'Patient')}
          {this.renderDateHelper('date_of_birth', 'Patient')}

          <Header>Patient Information</Header>

          <Form.Group inline>
            <Form.Radio
              label='In Patient'
              checked={this.state.form.Patient.is_in_patient === true}
              onChange={
                (e, data) => this.handleSelectChange('is_in_patient', data, 'Patient')}
            />
            <Form.Radio
              label='Out Patient'
              checked={this.state.form.Patient.is_in_patient === false}
              onChange={
                (e, data) => this.handleSelectChange('is_in_patient', data, 'Patient')}
            />
          </Form.Group>
        </Form>

      </Modal.Content>
    );
  }

  renderFinal() {
    return (
      <Modal.Content>
        <Container textAlign="center">
          <Header>Successfully Created!</Header>
        </Container>
      </Modal.Content>
    );
  }

  renderCommentForm() {
    return (
      <Form.TextArea value={this.state.form.Admission_record.comment} label='Note' placeholder="Add Note"
        onChange={e => this.handleInputChange(e, "comment", 'Admission_record')}
      />
    );
  }

  renderDateHelper(field, formtype) {
    const date = this.state.form[formtype][field] === null ? '' : moment(this.state.form[formtype][field]).format('l');
    return (
      <Form.Field error={this.state.error[field]} className="user-field">
        <label>{STATE_CONST[field]}</label>
        <DateInput
          dateFormat="MM-DD-YYYY"
          placeholder="MM-DD-YYYY"
          value={date}
          iconPosition="left"
          onChange={
            (e, data) => this.handleDateChange(field, data, formtype)
          }
        />
        {!this.validateDate(field) && <Label basic color='red' pointing> Invalid Date </Label>}
      </Form.Field>
    );
  }

  validateDate(field) {
    if (field !== 'date_of_birth' && field !== 'discharge_date') return true;
    const { date_of_birth } = this.state.form.Patient;
    const { admission_date, discharge_date } = this.state.form.Admission_record;
    if (admission_date !== null && discharge_date !== null && moment(admission_date).isAfter(discharge_date, 'day')) return false;
    if (date_of_birth !== null && moment(date_of_birth).isAfter(moment(), 'day')) return false;
    return true;
  }

  renderFieldHelper(fields, formtype) {
    return (
      <Container>
        {fields.map(field => (
          <Form.Field
            className="user-field"
            key={field}
            error={this.state.error[field]}
          >
            <label>{field === "email" ? "Email (Optional)" : STATE_CONST[field]}</label>
            <Input maxLength='255' value={this.state.form[formtype][field]}
              placeholder={!PLACEHOLDER[field] ? STATE_CONST[field] : PLACEHOLDER[field]} onChange={e => this.handleInputChange(e, field, formtype)} />
            {field === 'email' && !this.validateEmail() && <Label basic color='red' pointing> Invalid Email </Label>}
            {field === 'phone_number' && !this.validatePhoneNum(field) && <Label basic color='red' pointing> Invalid Phone Number </Label>}
          </Form.Field>
        ))}
      </Container>
    );
  }

  validateField(fields) {
    const { User, Patient, Admission_record } = this.state.form;
    const errorFields = {};
    fields.map(field => {
      if (field !== 'discharge_date') {
        if (User[field] === '' || Patient[field] === '' || Admission_record[field] === '' || Admission_record[field] === null || Patient[field] === null) {
          errorFields[field] = true;
        }
      }
      if (!this.validateDate(field) || !this.validatePhoneNum(field)) errorFields[field] = true;
    });
    this.setState({
      error: {
        ...this.state.form.error,
        ...errorFields
      }
    });
    return (!Object.keys(errorFields).length);
  }

  validateEmail() {
    const { email } = this.state.form.User;
    const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return email === '' || regex.test(String(email).toLowerCase());
  }

  validatePhoneNum(field) {
    const { phone_number } = this.state.form.User;
    const regex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4}$/;
    return field === "phone_number" ? (phone_number === "" || regex.test(String(phone_number))) : true;
  }


  renderRepeatDropDownForm() {
    return (
      <Form.Field
        defaultValue={'1'}
        className="user-field"
        control={Select}
        options={PATIENT_CAT}
        label={{ children: 'Patient Category', htmlFor: 'form-select-control-repeat' }}
        placeholder="1"
        search
        searchInput={{ id: 'form-select-control-repeat' }}
        onChange={
          (e, data) => this.handleSelectChange('patient_category', data, 'Admission_record')}
      />
    );
  }

  renderModalActionButton() {
    const nextBtn = ['Next', 'Next', 'Create', 'Done'];
    return (
      <Grid columns={2} className="modal-action">
        <Grid.Column>
          {this.props.slideIndex !== 4 &&
            <Button
              className="back-btn"
              floated="left"
              onClick={this.onPrevClick}
            >
              Back</Button>}
        </Grid.Column>
        <Grid.Column>
          <Button
            className="next-btn"
            floated="right"
            primary
            onClick={e => this.onNextClick(e)}>
            {nextBtn[this.props.slideIndex - 1]}
          </Button>
        </Grid.Column>
      </Grid>
    )
  }

  onPrevClick = (e) => {
    if (!(this.props.slideIndex === 3 && !this.props.exists)) {
      this.setState(this.initialState);
    }
    this.props.prevSlide();
  }

  onClose = (e) => {
    this.setState(this.initialState);
    this.props.onClose();
  }

  onNextClick(event) {
    const { slideIndex } = this.props;
    switch (slideIndex) {
      case 1:
        return this.handlemrnSubmit();
      case 2:
        return this.handleNewAccountSubmit();
      case 3:
        return this.handleNewAdmissionSubmit(event);
      default:
        this.onClose();
    }
  }

  renderPage() {
    const { slideIndex } = this.props;
    switch (slideIndex) {
      case 1:
        return this.rendermrnCheck();
      case 2:
        return this.renderNewAccount();
      case 3:
        return this.renderNewAdmissionRecord();
      default:
        return this.renderFinal();
    }
  }

  render() {
    const { open } = this.props;
    return (
      <Modal size="tiny" className="createUserPopupModal" closeIcon onClose={this.onClose} open={open}>
        <Modal.Header>Patient</Modal.Header>
        {this.renderPage()}
        <Modal.Actions children={this.renderModalActionButton()} />
        <Confirm
          id="create-patient-popup-confirm"
          open={this.state.isConfirming}
          content="Are you sure you want to create this patient?"
          confirmButton="Yes"
          onConfirm={ this.handleConfirm.bind(this) }
          cancelButton="No"
          onCancel={ () => this.setState({isConfirming: false}) } />
      </Modal>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    {
      createPatient: CreateUserAction.createPatient,
      createAdmissionRecord: CreateUserAction.createAdmissionRecord,
      getPatient: CreateUserAction.getPatient,
      prevSlide: CreateUserAction.prevSlide,
      nextSlide: CreateUserAction.nextSlide,
      getUsers: UserAction.getUsers
    },
    dispatch
  );
}

const mapStateToProps = state => (
  {
    error: state.createUser.error,
    slideIndex: state.createUser.slideIndex,
    exists: state.createUser.isExisting,
    patient: state.createUser.user
  });

export default connect(mapStateToProps, mapDispatchToProps)(CreatePatientPopup);
