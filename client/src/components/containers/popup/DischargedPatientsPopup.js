import React, { Component } from "react";
import { Button, Modal, Container, Menu, Table, Icon, Input, Confirm } from "semantic-ui-react";
import { connect } from "react-redux";
import { UserAction } from "actions";
import { bindActionCreators } from 'redux';
import "./UserPopup.css";

const DIR_MAP = {
  "1" : "ascending",
  "-1" : "descending"
}

const INITIAL_STATE = {
  deleteOpen:false,
  deleteTarget: null,
  searchText: "",
  items: [],
  sortKeys: [],
  sortDirection: 1,
};

class DischargedPatientsPopup extends Component{
  constructor(props) {
    super(props);
    this.state = INITIAL_STATE;
    this._handleSearchInputChange = this._handleSearchInputChange.bind(this);
  }

  static getDerivedStateFromProps(props, state) {
    if (props.user.itemsDischarged) {
      const { searchText, sortKeys, sortDirection } = state;
      const processedItems = props.user.itemsDischarged
        .filter(({User, Patient}) => {
          const fullName = `${User.first_name} ${User.last_name}`;
          return fullName.toLowerCase().includes(searchText.toLowerCase()) || User.phone_number.includes(searchText.toLowerCase())
            || User.email.toLowerCase().includes(searchText.toLowerCase()) || Patient.mrn.toLowerCase().includes(searchText.toLowerCase());
        })
        .sort((item1, item2) => {
          const comparable1 = sortKeys.reduce((acc, key) => {
            const targetKey1 = item1.User[key] || item1.Patient[key];
            return acc + targetKey1;
          }, "");
          const comparable2 = sortKeys.reduce((acc, key) => {
            const targetKey2 = item2.User[key] || item2.Patient[key];
            return acc + targetKey2;
          }, "");
          if (comparable1 > comparable2)
            return sortDirection;
          if (comparable1 < comparable2)
            return -1 * sortDirection;
          return 0;
        });
      return {
        items: processedItems
      };
    }
    return {};
  }

  _handleSearchInputChange(event, { value }) {
    this.setState({ searchText: value });
  }

  _deleteOpen(target) {
    const {deleteOpen} = this.state;
    this.setState({
      deleteOpen: !deleteOpen,
      deleteTarget: target
    })
  };

  handleSort(keys) {
      const { sortDirection } = this.state;
      const newDirection = sortDirection === 1 ? -1 : 1;
      this.setState({
        sortDirection: newDirection,
        sortKeys: keys
      });
  }

  handleDeleteSubmit() {
    if (this.state.deleteTarget)
      this.props.deletePatient(this.state.deleteTarget);
    this._deleteOpen(null);
  }

  _renderTableRow(user) {
    const { User, Patient } = user;
    return (
      <Table.Row
        key={ User.id }>
        <Table.Cell content={`${User.first_name} ${User.last_name}`} />
        <Table.Cell content={Patient.mrn} />
        <Table.Cell content={User.email} />
        <Table.Cell content={User.phone_number} />
        <Table.Cell >
          <Button negative icon onClick={ this._deleteOpen.bind(this, User) }>
          <Icon name='delete'/></Button></Table.Cell>
      </Table.Row>
    );
  }

   _closePopup = () => {
    this.setState(INITIAL_STATE);
    this.props.closePopup();
  };

  render() {
    const { sortKeys, sortDirection, searchText, items } = this.state;
    const sortKeysToString = sortKeys.join(" ");
    const direction = DIR_MAP[sortDirection];
    return(
      <Modal size="large" className="createUserPopupModal" closeIcon onClose={this._closePopup} open={ this.props.user.popupDischarged }>
        <Modal.Header>
          Discharged Patients
          </Modal.Header>
            <Modal.Content scrolling>
            <Container>
                  <Input
                    style={{ width: "28rem" }}
                    icon="search"
                    iconPosition="left"
                    placeholder="Search"
                    onChange={ this._handleSearchInputChange } />

                  <Table basic="very" columns={4} selectable sortable>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell
                        sorted={sortKeysToString === "first_name last_name" ? direction : null}
                        onClick={this.handleSort.bind(this, ["first_name", "last_name"])}>
                        Name
                      </Table.HeaderCell>
                      <Table.HeaderCell
                        sorted={sortKeysToString === "mrn" ? direction : null}
                        onClick={this.handleSort.bind(this, ["mrn"])}>
                        MRN
                      </Table.HeaderCell>
                      <Table.HeaderCell
                        sorted={sortKeysToString === "email" ? direction : null}
                        onClick={this.handleSort.bind(this, ["email"])}>
                        Email
                      </Table.HeaderCell>
                      <Table.HeaderCell
                        sorted={sortKeysToString === "phone_number" ? direction : null}
                        onClick={this.handleSort.bind(this, ["phone_number"])}>
                        Phone
                      </Table.HeaderCell>
                      <Table.HeaderCell>
                        Delete
                      </Table.HeaderCell>
                      </Table.Row>
                    </Table.Header>

                  <Table.Body
                    children={ items.map(this._renderTableRow.bind(this)) } />
                  <Confirm
                    id="dischargePatientPopup_confirm"
                    content= "Are you sure you want to delete this patient?"
                    confirmButton="Delete"
                    open={this.state.deleteOpen}
                    onCancel={this._deleteOpen.bind(this, null)}
                    onConfirm={ this.handleDeleteSubmit.bind(this) }/>
                  </Table>
                </Container>

            </Modal.Content>
        </Modal>
    );
    }
  }

const mapStateToProps = state => (
  { user: state.user});

const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    { deletePatient: UserAction.deletePatient,
      closePopup: UserAction.closeDischargedPopup },
    dispatch
  );
}


export default connect(mapStateToProps, mapDispatchToProps)(DischargedPatientsPopup)
