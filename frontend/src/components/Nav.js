import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Collapse, Image, NavDropdown, Modal } from "react-bootstrap";
import Select from "react-select";
import Logo from "../assets/images/logo.png";
import UserIcon from "../assets/images/user.png";
import DownIcon from "../assets/images/down.png";
import EditIcon from "../assets/images/edit.png";
import PasswordIcon from "../assets/images/password.png";
import LanguageIcon from "../assets/images/language.png";
import LogoutIcon from "../assets/images/logout.png";
import MenuIcon from "../assets/images/menu.png";
import CloseIcon from "../assets/images/close.png";
// import CameraIcon from "../assets/images/camera.png";
import WarningIcon from "../assets/images/delete.png";
import SuccessIcon from "../assets/images/success.png";
import {
  capitalizeFirst,
  departmentCodeToTitle,
  validateToken,
} from "../utils/utils";
import {
  changePasswordApi,
  departmentListApi,
  updateUserInfoApi,
  userInfoApi,
} from "../api/api";
import { jwtDecode } from "jwt-decode";

const formStyle = {
  control: (baseStyles) => ({
    ...baseStyles,
    border: "1px solid rgba(222, 226, 230, 0.75)",
    borderRadius: "6px",
    boxShadow: "none",
    fontSize: "16px",
    height: "38px",
    minHeight: "38px",
    fontFamily: "Kanit-Light",
    color: "rgba(22, 25, 44, 0.75)",
    padding: "0px 0 2px 0",
  }),
  singleValue: (baseStyles) => ({
    ...baseStyles,
    color: "rgba(22, 25, 44, 0.75)",
    fontFamily: "Kanit-Light",
    paddingBottom: "1px",
  }),
  option: (baseStyles, { isDisabled, isFocused, isSelected }) => ({
    ...baseStyles,
    backgroundColor: isDisabled
      ? undefined
      : isSelected
        ? "rgba(231, 234, 240, 0.75)"
        : isFocused
          ? "rgba(231, 234, 240, 0.35)"
          : undefined,
    color: "rgba(22, 25, 44, 0.75)",
    fontFamily: "Kanit-Light",
  }),
  menu: (baseStyles) => ({
    ...baseStyles,
    zIndex: 9999,
  }),
  indicatorsContainer: (baseStyles) => ({
    ...baseStyles,
    height: "38px",
  }),
  placeholder: (baseStyles) => ({
    ...baseStyles,
    color: "rgba(51, 52, 53, 0.15) !important",
    fontFamily: "Kanit-Light",
    fontSize: "16px",
    paddingLeft: "4px",
  }),
};

const Profile = ({ name, lastName, department }) => {
  return (
    <div className="profile-dropdown-container">
      {/* <Image src={UserIcon} className="profile-image" alt="user" /> */}
      <div className="profile-name-container">
        <p>
          {name ? name : "-"} {lastName}
        </p>
        <span className="user-role">{capitalizeFirst(department)}</span>
      </div>
      <Image src={DownIcon} className="chevron-down" alt="chevron-down" />
    </div>
  );
};

const Nav = ({ page }) => {
  const { t, i18n } = useTranslation();

  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState(false);
  const [menu, setMenu] = useState("profile");
  // const [profileImage, setProfileImage] = useState(UserIcon);
  const [formData, setFormData] = useState({
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    department: "",
    acl: [],
    status: 1,
    password: "",
    confirmPassword: "",
    errorFirstName: "",
    errorLastName: "",
    errorPassword: "",
    errorConfirmPassword: "",
  });
  const [name, setName] = useState("-");
  const [lastName, setLastName] = useState("");
  const [department, setDepartMent] = useState("");
  const [successModal, setSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [successTitle, setSuccessTitle] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorTitle, setErrorTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const profileRef = useRef();

  useEffect(() => {
    (async () => {
      try {
        const language = localStorage.getItem("language");

        i18n.changeLanguage(language ? language : "th");

        const token = validateToken();

        if (!token) {
          navigate("/login");
        }

        const decode = jwtDecode(token);

        const res = await userInfoApi(
          token,
          decode.payload?.userid ? decode.payload.userid : ""
        );

        const departmentResult = await departmentListApi(token);
        const departmentArr = [];

        if (departmentResult.data.result.length) {
          departmentResult.data.result.map((item) => {
            departmentArr.push({
              label: capitalizeFirst(item.title),
              value: item.code,
            });

            return item;
          });
        }

        setName(res.data.message?.name ? res.data.message.name : "-");
        setLastName(
          res.data.message?.lastname ? res.data.message.lastname : ""
        );
        setDepartMent(
          res.data.message?.department
            ? departmentCodeToTitle(departmentArr, res.data.message.department)
            : ""
        );

        setFormData({
          ...formData,
          id: res.data.message?.id ? res.data.message.id : "",
          firstName: res.data.message?.name ? res.data.message.name : "",
          lastName: res.data.message?.lastname ? res.data.message.lastname : "",
          email: res.data.message?.email ? res.data.message.email : "",
          department: res.data.message?.department
            ? res.data.message.department
            : "",
          acl: res.data.message?.acl ? res.data.message.acl : [1],
          status: res.data.message?.status ? res.data.message.status : 1,
        });
      } catch (e) {
        console.log(e);
      }
    })();
  }, []);

  // const handleChange = (e) => {
  //   setProfileImage(URL.createObjectURL(e.target.files[0]));
  // };

  const updateProfile = async () => {
    try {
      if (!formData.firstName || !formData.lastName) {
        setFormData({
          ...formData,
          errorFirstName: formData.firstName ? "" : t("errorFirstName"),
          errorLastName: formData.lastName ? "" : t("errorLastName"),
        });

        return;
      }

      const token = validateToken();

      if (!token) {
        navigate("/login");
      }

      await updateUserInfoApi(token, formData);

      setName(formData.firstName);
      setLastName(formData.lastName);

      setModal(false);
      setSuccessModal(true);
      setSuccessTitle(t("updateProfileSuccessTitle"));
      setSuccessMessage(t("updateProfileSuccessMessage"));
    } catch (e) {
      setModal(false);
      setErrorModal(true);
      setErrorTitle(t("updateProfileErrorTitle"));
      setErrorMessage(t("updateProfileErrorMessage"));
    }
  };

  const updatePassword = async () => {
    try {
      if (!formData.password || !formData.confirmPassword) {
        setFormData({
          ...formData,
          errorPassword: formData.password ? "" : t("errorEmptyPassword"),
          errorConfirmPassword: formData.confirmPassword
            ? ""
            : t("errorEmptyConfirmPassword"),
        });

        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setFormData({
          ...formData,
          errorConfirmPassword: t("mismatchPassword"),
        });

        return;
      } else {
        setFormData({
          ...formData,
          errorConfirmPassword: "",
        });
      }

      const token = validateToken();

      if (!token) {
        navigate("/login");
      }

      await changePasswordApi(token, formData.password);

      setModal(false);
      setSuccessModal(true);
      setSuccessTitle(t("changePasswordSuccessTitle"));
      setSuccessMessage(t("changePasswordSuccessMessage"));
    } catch {
      setModal(false);
      setErrorModal(true);
      setErrorTitle(t("changePasswordErrorTitle"));
      setErrorMessage(t("changePasswordErrorMessage"));
    }
  };

  const logout = () => {
    localStorage.removeItem("token");

    navigate("/login");
  };

  return (
    <>
      <div className="nav-container prevent-select">
        <div className="nav-logo-container">
          <Image src={Logo} alt="Saijo Denki" className="nav-logo" />
        </div>
        <div className="nav-menu-container me-3">
          <div
            className={
              page === "document" ? "nav-menu me-5 active" : "nav-menu me-5"
            }
            onClick={() => navigate("/")}
          >
            <span>{t("documents")}</span>
          </div>
          {/* <div
            className={
              page === "files" ? "nav-menu me-5 active" : "nav-menu me-5"
            }
            onClick={() => navigate("/files")}
          >
            <span>{t("fileManagement")}</span>
          </div> */}
          <div
            className={
              page === "admin" ? "nav-menu me-5 active" : "nav-menu me-5"
            }
            onClick={() => navigate("/admin")}
          >
            <span>{t("admin")}</span>
          </div>
        </div>
        <div
          className="nav-menu-toggle-container"
          onClick={() => setOpen(!open)}
          aria-controls="left-nav"
          aria-expanded={open}
        >
          <Image src={MenuIcon} alt="menu" className="nav-toggle-menu-icon" />
        </div>
        <div className="d-block d-lg-none" style={{ flex: 1 }}></div>
        <div className="user-dropdown-container">
          <NavDropdown
            id="profile"
            title={
              <Profile
                name={name}
                lastName={lastName}
                department={department}
              />
            }
          >
            <NavDropdown.Header className="nav-dropdown-menu">
              <div className="nav-dropdown-header">
                <span>{t("department")}</span>
                <p>{capitalizeFirst(department)}</p>
              </div>
            </NavDropdown.Header>
            <NavDropdown.Divider className="m-0" />
            <NavDropdown.Header
              className="nav-dropdown-menu pointer"
              onClick={() => {
                setMenu("profile");
                setModal(true);
              }}
            >
              <Image src={EditIcon} className="nav-menu-icon me-3" />
              {t("editProfile")}
            </NavDropdown.Header>
            <NavDropdown.Header
              className="nav-dropdown-menu pointer"
              onClick={() => {
                setMenu("password");
                setModal(true);
              }}
            >
              <Image src={PasswordIcon} className="nav-menu-icon me-3" />
              {t("changePassword")}
            </NavDropdown.Header>
            <NavDropdown.Header
              className="nav-dropdown-menu pointer"
              onClick={() => {
                setMenu("language");
                setModal(true);
              }}
            >
              <Image src={LanguageIcon} className="nav-menu-icon me-3" />
              {t("language")}
            </NavDropdown.Header>
            <NavDropdown.Divider className="m-0" />
            <NavDropdown.Header
              className="nav-dropdown-menu pointer"
              onClick={() => logout()}
            >
              <Image src={LogoutIcon} className="nav-menu-icon me-3" />
              {t("logout")}
            </NavDropdown.Header>
          </NavDropdown>
        </div>
      </div>
      {open && (
        <div className="nav-modal-background" onClick={() => setOpen(false)} />
      )}
      <Collapse in={open} dimension="width" className="left-menu-container">
        <div id="left-nav">
          <div className="p-3">
            <Image src={Logo} alt="Saijo Denki" className="nav-logo" />
          </div>
          <div>
            <div
              className={
                page === "document" ? "nav-left-menu active" : "nav-left-menu"
              }
              onClick={() => navigate("/")}
            >
              {t("documents")}
            </div>
            {/* <div
              className={
                page === "files" ? "nav-left-menu active" : "nav-left-menu"
              }
              onClick={() => navigate("/files")}
            >
              {t("fileManagement")}
            </div> */}
            <div
              className={
                page === "admin" ? "nav-left-menu active" : "nav-left-menu"
              }
              onClick={() => navigate("/admin")}
            >
              {t("admin")}
            </div>
          </div>
        </div>
      </Collapse>
      <Modal show={modal} backdrop="static" centered>
        <div className="nav-modal-container">
          <div className="nav-modal-left-container">
            {/* <div className="profile-image-container">
              {menu === "profile" ? (
                <div
                  className="profile-image-upload-container pointer prevent-select"
                  onClick={() => profileRef.current.click()}
                >
                  <Image src={profileImage} alt={t("profile")} />
                  <div className="profile-image-filter">
                    <Image src={CameraIcon} alt={t("camera")} />
                    <p className="mb-0">{t("uploadImage")}</p>
                  </div>
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleChange}
                    ref={profileRef}
                  />
                </div>
              ) : (
                <div className="profile-image-upload-container">
                  <Image src={profileImage} alt={t("profile")} />
                </div>
              )}
            </div> */}
            <div
              className={
                menu === "profile"
                  ? "profile-tab active mt-5 pointer"
                  : "profile-tab mt-5 pointer"
              }
              onClick={() => setMenu("profile")}
            >
              <Image src={EditIcon} alt={t("edit")} className="me-2" />
              {t("editProfile")}
            </div>
            <div
              className={
                menu === "password"
                  ? "profile-tab active pointer"
                  : "profile-tab pointer"
              }
              onClick={() => setMenu("password")}
            >
              <Image src={PasswordIcon} alt={t("password")} className="me-2" />
              {t("changePassword")}
            </div>
            <div
              className={
                menu === "language"
                  ? "profile-tab active pointer"
                  : "profile-tab pointer"
              }
              onClick={() => setMenu("language")}
            >
              <Image src={LanguageIcon} alt={t("language")} className="me-2" />
              {t("language")}
            </div>
          </div>
          {menu === "profile" && (
            <div className="nav-modal-right-container">
              <div className="modal-header-container mt-3">
                <h4 className="mt-2">{t("editProfile")}</h4>
                <div
                  className="close-modal-btn"
                  onClick={() => setModal(false)}
                >
                  <Image
                    src={CloseIcon}
                    alt={t("close")}
                    className="close-icon"
                  />
                </div>
              </div>
              <div style={{ padding: "10px 20px" }}>
                <div className="form-group-input">
                  <div
                    className={formData.errorFirstName.length ? "error" : ""}
                  >
                    <label className="form-label">{t("firstName")}</label>
                    <input
                      className="form-input"
                      placeholder={t("firstName")}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          firstName: e.target.value,
                          errorFirstName: "",
                        })
                      }
                      defaultValue={formData.firstName}
                    />
                    {formData.errorFirstName.length ? (
                      <p className="error-text mt-1 mb-0">
                        {formData.errorFirstName}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="form-group-input mt-3">
                  <div className={formData.errorLastName.length ? "error" : ""}>
                    <label className="form-label">{t("lastName")}</label>
                    <input
                      className="form-input"
                      placeholder={t("lastName")}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          lastName: e.target.value,
                          errorLastName: "",
                        })
                      }
                      defaultValue={formData.lastName}
                    />
                    {formData.errorLastName.length ? (
                      <p className="error-text mt-1 mb-0">
                        {formData.errorLastName}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
              <div style={{ flex: 1 }} />
              <div className="modal-footer-container">
                <button className="confirm-btn" onClick={() => updateProfile()}>
                  {t("update")}
                </button>
              </div>
            </div>
          )}
          {menu === "password" && (
            <div className="nav-modal-right-container">
              <div className="modal-header-container mt-3">
                <h4 className="mt-2">{t("changePassword")}</h4>
                <div
                  className="close-modal-btn"
                  onClick={() => setModal(false)}
                >
                  <Image
                    src={CloseIcon}
                    alt={t("close")}
                    className="close-icon"
                  />
                </div>
              </div>
              <div style={{ padding: "10px 20px" }}>
                <div className="form-group-input">
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
                      <p className="error-text mt-1 mb-0">
                        {formData.errorPassword}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="form-group-input mt-3">
                  <div
                    className={
                      formData.errorConfirmPassword.length ? "error" : ""
                    }
                  >
                    <label className="form-label">{t("confirmPassword")}</label>
                    <input
                      className="form-input"
                      placeholder={t("confirmPassword")}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                          errorConfirmPassword: "",
                        })
                      }
                      type="password"
                    />
                    {formData.errorConfirmPassword.length ? (
                      <p className="error-text mt-1 mb-0">
                        {formData.errorConfirmPassword}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
              <div style={{ flex: 1 }} />
              <div className="modal-footer-container">
                <button
                  className="confirm-btn"
                  onClick={() => updatePassword()}
                >
                  {t("update")}
                </button>
              </div>
            </div>
          )}
          {menu === "language" && (
            <div className="nav-modal-right-container">
              <div className="modal-header-container mt-3">
                <h4 className="mt-2">{t("language")}</h4>
                <div
                  className="close-modal-btn"
                  onClick={() => setModal(false)}
                >
                  <Image
                    src={CloseIcon}
                    alt={t("close")}
                    className="close-icon"
                  />
                </div>
              </div>
              <div style={{ padding: "10px 20px" }}>
                <div className="form-group-input">
                  <div className={formData.errorPassword.length ? "error" : ""}>
                    <label className="form-label">{t("language")}</label>
                    <Select
                      options={[
                        {
                          label: "ไทย",
                          value: "th",
                        },
                        {
                          label: "English",
                          value: "en",
                        },
                      ]}
                      onChange={(e) => {
                        i18n.changeLanguage(e ? e.value : "");
                        localStorage.setItem("language", e ? e.value : "");
                      }}
                      classNamePrefix={"form-input"}
                      placeholder={t("language")}
                      styles={formStyle}
                      isSearchable={false}
                      components={{
                        IndicatorSeparator: () => null,
                      }}
                      defaultValue={{
                        label: i18n.language === "th" ? "ไทย" : "English",
                        value: i18n.language,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
      <Modal
        show={successModal}
        backdrop="static"
        centered
        size="sm"
        className="alert-modal"
      >
        <div className="modal-alert-header success p-4">
          <div>
            <Image src={SuccessIcon} alt={"success"} />
          </div>
          <h4 className="alert-title mt-4">{successTitle}</h4>
          <p className="alert-message mb-0">{successMessage}</p>
        </div>
        <div
          className="modal-footer-container"
          onClick={() => setSuccessModal(false)}
        >
          <button className="cancel-btn">{t("close")}</button>
        </div>
      </Modal>
      <Modal
        show={errorModal}
        backdrop="static"
        centered
        size="sm"
        className="alert-modal"
      >
        <div className="modal-alert-header error p-4">
          <div>
            <Image src={WarningIcon} alt={"error"} />
          </div>
          <h4 className="alert-title mt-4">{errorTitle}</h4>
          <p className="alert-message mb-0">{errorMessage}</p>
        </div>
        <div
          className="modal-footer-container"
          onClick={() => setErrorModal(false)}
        >
          <button className="cancel-btn">{t("close")}</button>
        </div>
      </Modal>
    </>
  );
};

Nav.propTypes = {
  page: PropTypes.string,
};

Profile.propTypes = {
  name: PropTypes.string,
  lastName: PropTypes.string,
  department: PropTypes.string,
};

export default Nav;
