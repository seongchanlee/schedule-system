import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from "react-router-dom";
import { AuthAction } from 'actions';
import { isEmpty } from "lodash";
import { bindActionCreators } from 'redux';
import { Form, Button, Segment, Label, Image, Loader } from "semantic-ui-react";
import { ReactComponent as Logo } from "assets/logo.svg";
import "./LoginForm.css";

class LoginForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: ""
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  static getDerivedStateFromProps(props, state) {
    if (!props.isFetching && props.hasLoggedIn) {
      const from = props.location && props.location.state && props.location.state.from.pathname
      from === "/login" ?
        props.history.push("/") : props.history.push(from);
    }
    return null;
  }

  handleInputChange(e) {
    const name = e.target.name;
    const value = e.target.value;
    this.setState({ [name]: value });
  }

  handleSubmit(e) {

    //if (validateForm())
    this.props.loginUser(this.state)
      .then(res => {
        this.props.history.push("/");
      })
      .catch(err => {
        alert(err);
      });
    e.preventDefault();
  }

  handleLoginError(field) {
    if (isEmpty(this.props.err) || field !== this.props.err.field)
      return null;
    return (
      <Label basic color='red' pointing>
        {this.props.err.message}
      </Label>
    );
  }

  render() {
    return (
      <div className="loginFormBackground">
        <div className="loginFormWrapper">
          <Logo className="loginLogo" />
          {this.props.isFetching ? (<Loader active inline/>) :
            <Segment className="centerLoginSegment">
              <Form onSubmit={this.handleSubmit} className="loginForm" >
                <Form.Field className="loginField">
                  <input
                    type="text"
                    name="username"
                    autoComplete="username"
                    placeholder="Username"
                    value={this.state.username}
                    onChange={this.handleInputChange}
                    style={{ border: "none", padding: "0", height: "50px" }} />
                  {this.handleLoginError("username")}
                </Form.Field>

                <Form.Field className="loginField">
                  <input
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    placeholder="Password"
                    value={this.state.password}
                    onChange={this.handleInputChange}
                    style={{ border: "none", padding: "0", height: "50px" }} />
                  {this.handleLoginError("password")}
                </Form.Field>
                <Button primary fluid type="submit" className="loginButton">
                  LOGIN
                </Button>
              </Form>
            </Segment>
          }
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => state.auth;
const mapDispatchToProps = dispatch => bindActionCreators({ loginUser: AuthAction.loginUser }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(LoginForm));
