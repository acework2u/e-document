import React from "react";
import { Modal } from "react-bootstrap";
import PropTypes from "prop-types";
import LoadingGif from "../assets/images/loading.gif";

const LoadingModal = ({ loading }) => {
  return (
    <Modal
      show={loading}
      backdrop="static"
      keyboard="false"
      centered
      id="loading-modal"
      className="loading-modal"
    >
      <img src={LoadingGif} alt="Saijo Denki" className="loading-logo" />
    </Modal>
  );
};

LoadingModal.propTypes = {
  loading: PropTypes.bool,
};

export default LoadingModal;
