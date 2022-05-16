import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { register2FAUser } from "../../actions/authActions";
import classnames from "classnames";

class Signup2FA extends Component {
  constructor() {
    super();
    this.state = {
      code: "",
      errors: {}
    };
  }

  componentDidMount() {
    // If logged in and user navigates to Register page, should redirect them to dashboard
    if (this.props.auth.isAuthenticated) {
      this.props.history.push("/dashboard");
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.errors) {
      this.setState({
        errors: nextProps.errors
      });
    }
  }

  onChange = e => {
    this.setState({ [e.target.id]: e.target.value });
  };

  onSubmit = e => {
    e.preventDefault();

    const codeData = {
        email: this.props.auth.email,
        code: this.state.code
    };

    this.props.register2FAUser(codeData, this.props.history);
  };

  render() {
    const { errors } = this.state;
    return (
      <div className="container">
        <div className="row">
          <div className="col s8 offset-s2">
            <Link to="/" className="btn-flat waves-effect">
              <i className="material-icons left">keyboard_backspace</i> Back to
              home
            </Link>
            <div className="col s12" style={{ paddingLeft: "11.250px" }}>
              <h4>
                <b>Sign Up - Set 2FA</b>
              </h4>
              <p className="grey-text text-darken-1">
                Scan the QR Code in the Authenticator app then enter the code that you see in the app in the text field and click Submit.
              </p>
              <img src={this.props.auth.qr} className="img-fluid" alt="QR Code" />
              <p>{this.props.auth.secret}</p>
            </div>
            <form noValidate onSubmit={this.onSubmit}>
              <div className="input-field col s12">
                <input
                  onChange={this.onChange}
                  value={this.state.code}
                  error={errors.code}
                  id="code"
                  type="text"
                  className={classnames("", {
                    invalid: errors.code
                  })}
                />
                <label htmlFor="name">Code</label>
                <span className="red-text">{errors.code}</span>
              </div>
              <div className="col s12" style={{ paddingLeft: "11.250px" }}>
                <button
                  style={{
                    width: "150px",
                    borderRadius: "3px",
                    letterSpacing: "1.5px",
                    marginTop: "1rem"
                  }}
                  type="submit"
                  className="btn btn-large waves-effect waves-light hoverable blue accent-3"
                >
                  Sign up 2 FA
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

Signup2FA.propTypes = {
  register2FAUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors
});

export default connect(
  mapStateToProps,
  { register2FAUser }
)(withRouter(Signup2FA));
