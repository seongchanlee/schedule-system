import React, { Component } from "react";
import { Grid, Icon, Header } from "semantic-ui-react";

export default class Page404 extends Component {

  render() {
    return (
      <Grid container
        textAlign="center"
        verticalAlign="middle"
        style={{ height: "50rem" }}>
        <Grid.Column>
          <Icon name="user md" size="massive" />
          <Header as='h1'>{ "Sorry, we couldn't find this page" }</Header>
        </Grid.Column>
      </Grid>
    );
  }
}
