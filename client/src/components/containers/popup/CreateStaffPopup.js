import React, { Component } from "react";
import { Label, Modal, Grid, Button, Select, Header, Input,
  Form, Container, Divider, Message, Confirm } from "semantic-ui-react";
import { DateInput } from 'semantic-ui-calendar-react';
import * as moment from 'moment';
import { UserAction, CreateUserAction } from 'actions';
import { STATE_CONST } from './CreateUserPopup';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { THERAPIST_TYPE } from "enums";

import './CreateUserPopup.css';

class CreateStaffPopup extends Component{
  constructor(props) {
    super(props);
    this.initialState = {
      isConfirming: false,
      form: {
        therapist_type: THERAPIST_TYPE[0].value,
        first_name: '',
        last_name:'',
        email:'',
        phone_number:'',
        type: '',
        permission_level:''
      },
      error: { // erase the optional fields?
        first_name: false,
        last_name:false,
        email:false,
        therapist_type: false,
        phone_number: false
      }
    };
    moment.locale('en');
    this.state = this.initialState;
    this.handleInputChange=this.handleInputChange.bind(this);
    this.handleDateChange=this.handleDateChange.bind(this);
    this.handleSelectChange=this.handleSelectChange.bind(this);
  }

  static getDerivedStateFromProps(props, state) {

    const permission = props.typeUser === 'Staff' ? 'Medium' : 'High';
    if (props.typeUser && props.typeUser !== state.form.typeUser) {
      return {
        ...state,
        form:{
          ...state.form,
        permission_level: permission,
        type: props.typeUser
      }};
    }
    return {};
  }

  handleInputChange(event, key) {
    const value = event.target && event.target.value;
    this.setState({form: {
      ...this.state.form,
      [key]: value}, error:{
      ...this.state.error,
      [key]: false
      }});
  }

  handleDateChange(field, { value }) {
    this.setState({form:{
      ...this.state.form,
      [field]: new Date(value)}});
  }

  handleSelectChange(field, { value } ) {
    this.setState({form: {
      ...this.state.form,
      [field]: value}});
  }

  handleFinalValidation(event) {
    event.preventDefault();
    if(!this.validateForm()) return;
    this.setState({isConfirming: true});

  }

  handleConfirm() {
    if (this.props.typeUser === 'Administrator') {
      this.handleCreateAdmin();
    } else {
      this.handleCreateStaff();
    }
    this.setState({isConfirming: false});
  }


  handleCreateStaff() {
    const {therapist_type, ... User} = this.state.form;
    const staff = Object.assign({
          Staff:{therapist_type:therapist_type},
          User});
    this.props.createStaff(staff)
      .then(() => this.props.getUsers())
      .catch(() => alert("Fatal: This should never happen"));
  }

  handleCreateAdmin() {
    const {therapist_type, ... User} = this.state.form;
    this.props.createAdmin({User})
      .then(() => this.props.getUsers())
      .catch(() => alert("Fatal: This should never happen"));
  }

  validateEmail() {
    const {email} = this.state.form;
    const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regex.test(String(email).toLowerCase());
  }

  validatePhoneNum(field) {
    const {phone_number} = this.state.form;
    const regex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4}$/;
    return field === "phone_number" ? (phone_number === "" || regex.test(String(phone_number))) : true;
  }

  validateForm() {
    const {email} = this.state.form;
    const errorFields={};
    Object.entries(this.state.error).map(entry => {
      if((entry[0] === 'email' && !this.validateEmail()) || this.state.form[entry[0]] === '' || !this.validatePhoneNum(entry[0])){
        errorFields[entry[0]] = true;
      }
    });
    this.setState({error: errorFields});
    return (!Object.keys(errorFields).length);
  }

  renderForm() {
    return(
      <Modal.Content scrolling>
        <Form id="create-user">
        {this.props.error && <Message negative>
          <Message.Header>There has been an error with your submission.</Message.Header>
          <p> {this.props.error.message} </p>
         </Message> }
          <Header>Basic Information</Header>
          {this.renderFieldHelper(['first_name', 'last_name', 'phone_number', 'email'])}

          {this.props.typeUser === 'Staff' &&
            <Container>
              <Divider/>
              <Header>Practitioner Information</Header>
              {this.renderRepeatDropDownForm(THERAPIST_TYPE, 'therapist_type')}
            </Container>
          }
        </Form>
      </Modal.Content>
    );
  }

  renderFinal() {
    return(
      <Modal.Content>
        <Container textAlign="center">
          <Header>Successfully Created!</Header>
        </Container>
      </Modal.Content>
    );
  }

  renderRepeatDropDownForm(type, field) {
    return(
      <Form.Field
        className="user-field"
        defaultValue={ THERAPIST_TYPE[0].value }
        control={ Select }
        options={ type }
        label={{ children: STATE_CONST[field], htmlFor: 'form-select-control-repeat' }}
        placeholder= { THERAPIST_TYPE[0].value }
        search
        searchInput={{ id: 'form-select-control-repeat' }}
        onChange={
        (e,data)=>this.handleSelectChange( field , data)}
      />
    );
  }

  renderDateHelper(field){
    const date = this.state.form[field] === '' ? '': moment(this.state.form[field]).format('l');
    return(
      <Form.Field className="user-field">
        <label>{STATE_CONST[field]}</label>
        <DateInput
          dateFormat="MM-DD-YYYY"
          placeholder="MM-DD-YYYY"
          value={date}
          iconPosition="left"
          onChange={ (e,data) => this.handleDateChange(field, data) }
        />
      </Form.Field>
    );
  }

  renderFieldHelper(fields){
    return(
      <Container>
        {fields.map(field=> (
          <Form.Field error={this.state.error[field]} key = {field}>
            <label>{STATE_CONST[field]}</label>
            <Input maxLength='255' placeholder={STATE_CONST[field]} onChange={e=> this.handleInputChange(e, field)}/>
            {field === 'email' && this.state.form.email !== '' && !this.validateEmail() && <Label basic color = 'red' pointing> Invalid Email </Label> }
            {field === 'phone_number' && !this.validatePhoneNum(field) && <Label basic color = 'red' pointing> Invalid Phone Number </Label> }
          </Form.Field>
        ))}
      </Container>
    );
  }

  renderModalActionButton(){
    return (
      <Grid columns={2} className="modal-action">
        <Grid.Column>
        {!this.props.created &&
          <Button
            className="back-btn"
            floated="left"
            onClick={this.onPrevClick}
          >
          Back
          </Button>
        }
        </Grid.Column>
        <Grid.Column>
          <Button
            primary
            className="next-btn"
            floated="right"
            onClick={e => this.onNextClick(e)}
          >
            {this.props.created? "Done": "Create"}
          </Button>
        </Grid.Column>
      </Grid>
    );
  }

  onPrevClick = (e) => {
      this.setState(this.initialState);
      this.props.prevSlide();
  }

  onNextClick(event){
    if(this.props.created){
      this.props.onClose();
    }else{
      this.handleFinalValidation(event);
    }
  }

  onClose = (e) => {
    this.setState(this.initialState);
    this.props.onClose();
  }

  render() {
    const {open, onClose } = this.props;
    return (
       <Modal size="tiny" className="createUserPopupModal" closeIcon onClose={ this.onClose } open={ open }>
        <Modal.Header>{this.props.typeUser}</Modal.Header>
        {!this.props.created && this.renderForm()}
        {this.props.created && this.renderFinal()}
        <Modal.Actions children={this.renderModalActionButton()}/>
        <Confirm
          id="create-staff-popup-confirm"
          content={`Are you sure you want to create this ${this.props.typeUser.toLowerCase()}?`}
          cancelButton="No"
          confirmButton="Yes"
          open={this.state.isConfirming}
          onConfirm={ this.handleConfirm.bind(this) }
          onCancel={ () => this.setState({isConfirming: false}) } />
      </Modal>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    {
      createAdmin: CreateUserAction.createAdmin,
      createStaff: CreateUserAction.createStaff,
      getUsers: UserAction.getUsers,
      getUserByEmail: CreateUserAction.getUserByEmail,
      prevSlide: CreateUserAction.prevSlide
    },
    dispatch
  );
}

const mapStateToProps = state => (
  { error:state.createUser.error,
    typeUser: state.createUser.typeUser,
    user: state.createUser.user,
    created: state.createUser.created});

export default connect(mapStateToProps, mapDispatchToProps)(CreateStaffPopup);