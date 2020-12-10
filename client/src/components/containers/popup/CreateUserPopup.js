import React, { Component } from "react";
import { Icon, Header, Button, Modal, Container} from "semantic-ui-react";
import CreatePatientPopup from "./CreatePatientPopup";
import CreateStaffPopup from "./CreateStaffPopup";
import { connect } from "react-redux";
import { CreateUserAction } from "actions";
import './CreateUserPopup.css';

export const STATE_CONST = {
  first_name:"First Name",
  last_name:"Last Name",
  email:"Email",
  phone_number:"Phone Number",
  date_of_birth:"Birth Date",
  address:"Address",
  mrn:"Medical Record Number",
  type_of_injury:"Type of Injury",
  patient_type:"Type of Patient",
  admission_date:"Admission Date",
  discharge_date:"Discharge Date",
  patient_program:"Patient Program",
  patient_category:"Patient Category",
  therapist_type:"Therapist Type",
  permission_level: "Permission Level",
  comment:"Notes",
};


class CreateUserPopup extends Component{
  constructor(props) {
    super(props);
  }

  _handleSelectUserClick = (e, { id }) => {
    this.props.dispatch(CreateUserAction.selectUser(id));
  };

  _closePopup = () =>{
    this.props.dispatch(CreateUserAction.closePopup())
  }

  render() {
    const { typeUser } = this.props;
    const labels = [ 'Administrator', 'Staff', 'Patient' ];
    return(
      <React.Fragment>
      <Modal size="tiny" className="createUserPopupModal" closeIcon onClose={this._closePopup} open={ this.props.popup }>
        <Modal.Header>
          New User
        </Modal.Header>
            <Modal.Content>
              <Header as='h2' icon textAlign='center' color="grey">
                <Icon name='users' circular />
                <Header.Content>Select Role</Header.Content>
              </Header>
              <Container textAlign='center' className="select-user">
                {labels.map(label=>(
                  <div key={label}>
                    <Button
                      size='big'
                      className="select-btn"
                      onClick={this._handleSelectUserClick}
                      id={label}
                    >
                    {label}
                    </Button>
                  </div>
                ))}
              </Container>
            </Modal.Content>
        </Modal>
        <CreatePatientPopup open ={ typeUser === 'Patient'} onClose={this._closePopup}/>
        <CreateStaffPopup open= { typeUser === 'Administrator' || typeUser === 'Staff' } onClose={this._closePopup}/>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state =>
({popup: state.createUser.popup,
  typeUser: state.createUser.typeUser
});

export default connect(mapStateToProps)(CreateUserPopup)
