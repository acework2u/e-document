import React, { useEffect, useState } from "react";
import { Image, Button, Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import LoginLogo from "../assets/images/login_logo.png";
import { loginApi } from "../api/api";
import LoadingModal from "../components/LoadingModal";
import WarningIcon from "../assets/images/delete.png";
import { validateToken } from "../utils/utils";

const Auth = () => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    errorUsername: "",
    errorPassword: "",
  });
  const [loginErrorModal, setLoginErrorModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = validateToken();

    if (token) {
      navigate("/");
    }
  }, []);

  const loginHandle = async () => {
    try {
      if (
        !formData.username.trim().length ||
        !formData.password.trim().length
      ) {
        setFormData({
          ...formData,
          errorUsername: formData.username.trim().length
            ? ""
            : t("errorEmptyUsername"),
          errorPassword: formData.password.trim().length
            ? ""
            : t("errorEmptyPassword"),
        });

        return;
      }

      setLoading(true);

      const result = await loginApi(formData.username, formData.password);

      const token = result.data.message.token;

      localStorage.setItem("token", token);

      setLoading(false);

      navigate("/");
    } catch (e) {
      console.log(e);
      setLoading(false);
      setLoginErrorModal(true);
    }
  };

  return (
    <div className="main flex-center">
      <div className="login-container">
        <div className="logo-container">
          <Image src={LoginLogo} alt="Saijo Denki" className="login-logo" />
        </div>
        <div className="login-form-container p-5">
          <h5 className="login-title mb-5">{t("loginTitle")}</h5>
          <div className="form-group-input">
            <div className={formData.errorUsername.length ? "error" : ""}>
              <label className="form-label">{t("username")}</label>
              <input
                className="form-input"
                placeholder={t("username")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    username: e.target.value,
                    errorUsername: "",
                  })
                }
              />
              {formData.errorUsername.length ? (
                <p className="error-text mt-1 mb-0">{formData.errorUsername}</p>
              ) : null}
            </div>
          </div>
          <div className="form-group-input mt-4">
            <div className={formData.errorPassword.length ? "error" : ""}>
              <label className="form-label">{t("password")}</label>
              <input
                className="form-input"
                placeholder={t("password")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    password: e.target.value,
                    errorPassword: "",
                  })
                }
                type="password"
              />
              {formData.errorPassword.length ? (
                <p className="error-text mt-1 mb-0">{formData.errorPassword}</p>
              ) : null}
            </div>
          </div>
          <Button
            type="button"
            className="login-btn mt-5"
            onClick={() => loginHandle()}
          >
            <span className="login-btn-text">{t("login")}</span>
          </Button>
        </div>
      </div>
      <LoadingModal loading={loading} />
      <Modal
        show={loginErrorModal}
        backdrop="static"
        centered
        size="sm"
        className="delete-modal"
      >
        <div className="modal-delete-header p-4">
          <div>
            <Image src={WarningIcon} alt={"delete"} className="delete-icon" />
          </div>
          <h4 className="delete-title mt-4">{t("loginError")}</h4>
          <p className="delete-message mb-0">{t("loginErrorMessage")}</p>
        </div>
        <div
          className="modal-footer-container"
          onClick={() => setLoginErrorModal(false)}
        >
          <button className="cancel-btn">{t("close")}</button>
        </div>
      </Modal>
    </div>
  );
};

export default Auth;
