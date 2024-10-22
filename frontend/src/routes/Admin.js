import React, { useState, useEffect, useRef } from "react";
import Nav from "../components/Nav";
import { useTranslation } from "react-i18next";
import Skeleton from "react-loading-skeleton";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import { Image, Table, Modal } from "react-bootstrap";
import ClearIcon from "../assets/images/clear.png";
import MoreIcon from "../assets/images/more.png";
import EditIcon from "../assets/images/edit.png";
import DeleteIcon from "../assets/images/bin.png";
import SortUpIcon from "../assets/images/sort_up.png";
import SortDownIcon from "../assets/images/sort_down.png";
import CloseIcon from "../assets/images/close.png";
import WarningIcon from "../assets/images/delete.png";
import SuccessIcon from "../assets/images/success.png";
import LoadingModal from "../components/LoadingModal";
import {
  capitalizeFirst,
  departmentCodeToTitle,
  userStatusComponent,
  validateToken,
} from "../utils/utils";
import {
  addUserApi,
  changePasswordApi,
  deleteUserApi,
  departmentListApi,
  updateUserInfoApi,
  userListApi,
} from "../api/api";

const menuStyle = {
  control: (baseStyles) => ({
    ...baseStyles,
    border: 0,
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
    color: "#16192c !important",
    opacity: 0.5,
    fontFamily: "Kanit-Light",
    fontSize: "16px",
    paddingLeft: "4px",
  }),
};

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

const Admin = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [loadingModal, setLoadingModal] = useState(false);
  const [userList, setUserList] = useState([]);
  const [userListFilter, setUserListFilter] = useState([]);
  const [showIndex, setShowIndex] = useState(-1);
  const [sortBy, setSortBy] = useState({
    key: "name",
    value: "asc",
  });
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState(1);
  const [limit, setLimit] = useState(25);
  const [enableNext, setEnableNext] = useState(false);
  const [enablePre, setEnablePre] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    firstName: "",
    lastName: "",
    tel: "",
    email: "",
    department: "",
    acl: [1],
    status: 1,
    username: "",
    password: "",
    confirmPassword: "",
    errorName: "",
    errorLastName: "",
    errorTel: "",
    errorEmail: "",
    errorDepartment: "",
    errorStatus: "",
    errorUsername: "",
    errorPassword: "",
    errorConfirmPassword: "",
  });
  const [deleteValue, setDeleteValue] = useState({
    value: "",
    error: "",
  });
  const [successModal, setSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [successTitle, setSuccessTitle] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorTitle, setErrorTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [departmentList, setDepartmentList] = useState([]);

  const filter = useRef({
    department: "",
    status: "",
  });
  const departmentRef = useRef(null);
  const statusRef = useRef(null);
  const sortByRef = useRef({
    key: "name",
    value: "asc",
  });

  const from = (page - 1) * limit;
  const to = Math.min(page * limit, userListFilter.length);

  useEffect(() => {
    (async () => {
      try {
        const token = validateToken();

        if (!token) {
          navigate("/login");
        }

        const res = await userListApi(token);

        const result = res.data.message ? res.data.message : [];
        const total = res.data.message?.length ? res.data.message.length : 0;

        const userArr = result.sort((a, b) => {
          if (a.name + a.lastname > b.name + b.lastname) {
            return 1;
          } else if (a.name + a.lastname < b.name + b.lastname) {
            return -1;
          }

          return 0;
        });

        setUserList(userArr);
        setUserListFilter(userArr);

        if (total / limit > 1) {
          setEnableNext(true);
        }

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

        setDepartmentList(departmentArr);
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const sortHandle = (key) => {
    sortByRef.current = {
      key: key,
      value:
        sortByRef.current.key === key
          ? sortByRef.current.value === "asc"
            ? "desc"
            : "asc"
          : "asc",
    };

    const userArr = userListFilter.sort((a, b) => {
      switch (true) {
        case key === "department":
          if (sortByRef.current.value === "asc") {
            if (a.department > b.department) {
              return 1;
            } else if (a.department < b.department) {
              return -1;
            }

            return 0;
          } else {
            if (a.department > b.department) {
              return -1;
            } else if (a.department < b.department) {
              return 1;
            }

            return 0;
          }
        case key === "status":
          if (sortByRef.current.value === "asc") {
            if (a.status > b.status) {
              return 1;
            } else if (a.status < b.status) {
              return -1;
            }

            return 0;
          } else {
            if (a.status > b.status) {
              return -1;
            } else if (a.status < b.status) {
              return 1;
            }

            return 0;
          }
        default:
          if (sortByRef.current.value === "asc") {
            if (a.name + a.lastname > b.name + b.lastname) {
              return 1;
            } else if (a.name + a.lastname < b.name + b.lastname) {
              return -1;
            }

            return 0;
          } else {
            if (a.name + a.lastname > b.name + b.lastname) {
              return -1;
            } else if (a.name + a.lastname < b.name + b.lastname) {
              return 1;
            }

            return 0;
          }
      }
    });

    setSortBy({
      key: key,
      value: sortByRef.current.value,
    });
    setUserList(userArr);
  };

  const goFirst = () => {
    setPage(1);
    setPageInput(1);
    setEnablePre(false);
    setEnableNext(true);
  };

  const goLast = () => {
    setPage(Math.ceil(userListFilter.length / limit));
    setPageInput(Math.ceil(userListFilter.length / limit));
    setEnableNext(false);
    setEnablePre(true);
  };

  const next = () => {
    setEnablePre(true);
    setPage((prevValue) => prevValue + 1);
    setPageInput((prevValue) => prevValue + 1);

    const lastPage = Math.min((page + 1) * limit, userListFilter.length);

    if (lastPage !== userListFilter.length) {
      setEnableNext(true);
    } else {
      goLast();
      setEnableNext(false);
    }
  };

  const prev = () => {
    setEnableNext(true);

    if (page) {
      setPage(page - 1);
      setPageInput(page - 1);

      if (page - 1 !== 1) {
        setEnablePre(true);
      } else {
        setEnablePre(false);
      }
    } else {
      goFirst();
    }
  };

  const pageHandle = (value) => {
    const re = /^[0-9\b]+$/;

    if (re.test(value)) {
      if (parseInt(value) <= 1) {
        setPage(1);
        setPageInput(1);
        setEnableNext(true);
        setEnablePre(false);
      } else if (Math.ceil(userListFilter.length / limit) > parseInt(value)) {
        setPage(value);
        setPageInput(value);
        setEnableNext(true);
        setEnablePre(true);
      } else {
        setPage(Math.ceil(userListFilter.length / limit));
        setPageInput(Math.ceil(userListFilter.length / limit));
        setEnableNext(false);
        setEnablePre(true);
      }
    } else {
      setTimeout(() => {
        setPage(1);
        setPageInput(1);
        setEnableNext(true);
        setEnablePre(false);
      }, 1000);
    }
  };

  const searchHandle = (val) => {
    try {
      const result = userList.filter((item) => {
        return (
          (item.name.toLowerCase().indexOf(val.toLowerCase()) >= 0 ||
            item.lastname.toLowerCase().indexOf(val.toLowerCase()) >= 0) &&
          (filter.current.department
            ? item.department.toLowerCase() ===
              filter.current.department.toLowerCase()
            : true) &&
          (filter.current.status.toString()
            ? item.status.toString() === filter.current.status.toString()
            : true)
        );
      });

      setPage(1);
      setEnablePre(false);

      setUserListFilter(result);

      if (result.length / limit > 1) {
        setEnableNext(true);
      } else {
        setEnableNext(false);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const filterHandle = () => {
    try {
      const result = userList.filter((item) => {
        return (
          (item.name.toLowerCase().indexOf(keyword.toLowerCase()) >= 0 ||
            item.lastname.toLowerCase().indexOf(keyword.toLowerCase()) >= 0) &&
          (filter.current.department
            ? item.department.toLowerCase() ===
              filter.current.department.toLowerCase()
            : true) &&
          (filter.current.status.toString()
            ? item.status.toString() === filter.current.status.toString()
            : true)
        );
      });

      setPage(1);
      setEnablePre(false);

      setUserListFilter(result);

      if (result.length / limit > 1) {
        setEnableNext(true);
      } else {
        setEnableNext(false);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const clearFilter = () => {
    filter.current = {
      department: "",
      status: "",
    };

    departmentRef.current.clearValue();
    statusRef.current.clearValue();

    setKeyword("");

    setPage(1);
    setEnablePre(false);

    filterHandle();
  };

  const clearForm = (type) => {
    if (type === "add") {
      setAddModal(false);
    } else if (type === "edit") {
      setEditModal(false);
    } else {
      setDeleteModal(false);
    }

    setFormData({
      id: "",
      firstName: "",
      lastName: "",
      tel: "",
      email: "",
      department: "",
      acl: [1],
      status: "1",
      username: "",
      password: "",
      confirmPassword: "",
      errorName: "",
      errorLastName: "",
      errorTel: "",
      errorEmail: "",
      errorDepartment: "",
      errorStatus: "",
      errorUsername: "",
      errorPassword: "",
      errorConfirmPassword: "",
    });
    setDeleteValue({ value: "", error: "" });
  };

  const validateForm = (type) => {
    if (type === "add") {
      if (
        !formData.firstName ||
        !formData.lastName ||
        !formData.email ||
        !formData.department ||
        !formData.status ||
        !formData.username ||
        !formData.password ||
        !formData.confirmPassword ||
        formData.password !== formData.confirmPassword
      ) {
        setFormData({
          ...formData,
          errorName: formData.firstName ? "" : t("errorEmptyFirstName"),
          errorLastName: formData.lastName ? "" : t("errorEmptyLastName"),
          errorEmail: formData.email ? "" : t("errorEmptyEmail"),
          errorDepartment: formData.department ? "" : t("errorEmptyDepartment"),
          errorStatus: formData.status ? "" : t("errorEmptyStatus"),
          errorUsername: formData.username ? "" : t("errorEmptyUsername"),
          errorPassword: formData.password ? "" : t("errorEmptyPassword"),
          errorConfirmPassword: formData.confirmPassword
            ? formData.password === formData.confirmPassword
              ? ""
              : t("mismatchPassword")
            : t("errorEmptyConfirmPassword"),
        });

        return;
      }

      addUserHandle();
    } else {
      if (
        !formData.firstName ||
        !formData.lastName ||
        !formData.email ||
        !formData.department ||
        !formData.status ||
        !formData.username ||
        formData.password !== formData.confirmPassword
      ) {
        console.log(
          formData.password !== formData.confirmPassword,
          formData.password,
          formData.confirmPassword
        );
        setFormData({
          ...formData,
          errorName: formData.firstName ? "" : t("errorEmptyFirstName"),
          errorLastName: formData.lastName ? "" : t("errorEmptyLastName"),
          errorEmail: formData.email ? "" : t("errorEmptyEmail"),
          errorDepartment: formData.department ? "" : t("errorEmptyDepartment"),
          errorStatus: formData.status ? "" : t("errorEmptyStatus"),
          errorUsername: formData.username ? "" : t("errorEmptyUsername"),
          errorPassword: formData.confirmPassword
            ? formData.password
              ? ""
              : t("errorEmptyPassword")
            : "",
          errorConfirmPassword: formData.confirmPassword
            ? formData.password === formData.confirmPassword
              ? ""
              : t("mismatchPassword")
            : formData.password
              ? t("errorEmptyConfirmPassword")
              : "",
        });

        return;
      }

      updateUserHandle();
    }
  };

  const addUserHandle = async () => {
    try {
      const token = validateToken();

      if (!token) {
        navigate("/login");
      }

      setLoadingModal(true);

      const res = await addUserApi(token, formData);

      setLoadingModal(false);
      clearForm("add");

      setSuccessModal(true);
      setSuccessTitle(t("addUserSuccessTitle"));
      setSuccessMessage(t("addUserSuccessMessage"));

      await fetchUserList();
    } catch (e) {
      console.log(e);
      setLoadingModal(false);

      clearForm("add");

      setErrorModal(true);
      setErrorTitle(t("addUserErrorTitle"));
      setErrorMessage(t("addUserErrorMessage"));
    }
  };

  const updateUserHandle = async () => {
    try {
      const token = validateToken();

      if (!token) {
        navigate("/login");
      }

      setLoadingModal(true);

      await updateUserInfoApi(token, formData);

      if (formData.password) {
        await changePasswordApi(token, formData.password);
      }

      setLoadingModal(false);
      clearForm("edit");

      setSuccessModal(true);
      setSuccessTitle(t("updateUserSuccessTitle"));
      setSuccessMessage(t("updateUserSuccessMessage"));

      await fetchUserList();
    } catch (e) {
      console.log(e.response.data);

      setLoadingModal(false);
      clearForm("edit");

      setErrorModal(true);
      setErrorTitle(t("updateUserErrorTitle"));
      setErrorMessage(t("updateUserErrorMessage"));
    }
  };

  const deleteUserHandle = async () => {
    try {
      if (deleteValue.value !== "Delete") {
        setDeleteValue({ ...deleteValue, error: t("errorDeleteInput") });

        return;
      }

      const token = validateToken();

      if (!token) {
        navigate("/login");
      }

      setLoadingModal(true);

      await deleteUserApi(token, formData.id);

      await fetchUserList();

      setLoadingModal(false);
      clearForm("delete");

      setSuccessModal(true);
      setSuccessTitle(t("deleteUserSuccessTitle"));
      setSuccessMessage(t("deleteUserSuccessMessage"));
    } catch (e) {
      console.log(e.response.data);

      setLoadingModal(false);
      clearForm("delete");

      setErrorModal(true);
      setErrorTitle(t("deleteUserErrorTitle"));
      setErrorMessage(t("deleteUserErrorMessage"));
    }
  };

  const fetchUserList = async () => {
    try {
      const token = validateToken();

      if (!token) {
        navigate("/login");
      }

      const res = await userListApi(token);

      const result = res.data.message ? res.data.message : [];
      const total = res.data.message?.length ? res.data.message.length : 0;

      const userArr = result.sort((a, b) => {
        if (a.name + a.lastname > b.name + b.lastname) {
          return 1;
        } else if (a.name + a.lastname < b.name + b.lastname) {
          return -1;
        }

        return 0;
      });

      setUserList(userArr);
      setUserListFilter(userArr);

      if (total / limit > 1) {
        setEnableNext(true);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main">
      <Nav page={"admin"} />
      <div className="card-container">
        <h5 className="card-title mb-0">{t("userList")}</h5>
        <div className="filter-container mt-4">
          <div className="keyword-container">
            <label className="keyword-label me-2">{t("keyword")} :</label>
            <input
              className="keyword-input"
              placeholder={t("keyword")}
              onChange={(e) => {
                setKeyword(e.target.value);
                searchHandle(e.target.value);
              }}
              value={keyword}
            />
          </div>
          <div className="filter-input-container">
            <label className="filter-label">{t("department")}</label>
            <Select
              ref={departmentRef}
              options={departmentList}
              onChange={(e) => {
                filter.current = {
                  ...filter.current,
                  department: e ? e.value : "",
                };
                filterHandle();
              }}
              placeholder={t("department")}
              classNamePrefix="filter-input"
              styles={menuStyle}
              maxMenuHeight={150}
              components={{
                IndicatorSeparator: () => null,
              }}
            />
          </div>
          <div className="filter-input-container">
            <label className="filter-label">{t("status")}</label>
            <Select
              ref={statusRef}
              options={[
                {
                  label: t("enable"),
                  value: "1",
                },
                {
                  label: t("disable"),
                  value: "0",
                },
              ]}
              onChange={(e) => {
                filter.current = {
                  ...filter.current,
                  status: e ? e.value : "",
                };
                filterHandle();
              }}
              placeholder={t("status")}
              classNamePrefix="filter-input"
              styles={menuStyle}
              maxMenuHeight={150}
              components={{
                IndicatorSeparator: () => null,
              }}
            />
          </div>
          <div className="clear-btn pointer" onClick={() => clearFilter()}>
            <Image src={ClearIcon} alt={"clear"} className="clear-btn-icon" />
          </div>
          <div className="table-btn-container">
            <button
              type="button"
              className="add-btn"
              onClick={() => setAddModal(true)}
            >
              {t("addUser")}
            </button>
          </div>
        </div>
        <div className="table-container mt-4">
          <Table className="w-100 align-middle mb-0">
            <thead className="sticky-top">
              <tr>
                <th
                  className="table-header pointer prevent-select"
                  onClick={() => sortHandle("name")}
                >
                  <div>
                    <span>{t("name")}</span>
                    <div className="sort-container">
                      <Image
                        src={SortUpIcon}
                        alt={t("sortUp")}
                        className={
                          sortBy.key === "name" && sortBy.value === "asc"
                            ? "sort-icon active"
                            : "sort-icon"
                        }
                      />
                      <Image
                        src={SortDownIcon}
                        alt={t("sortDown")}
                        className={
                          sortBy.key === "name" && sortBy.value === "desc"
                            ? "sort-icon active"
                            : "sort-icon"
                        }
                      />
                    </div>
                  </div>
                </th>
                <th
                  className="table-header pointer prevent-select"
                  onClick={() => sortHandle("department")}
                >
                  <div>
                    <span>{t("department")}</span>
                    <div className="sort-container">
                      <Image
                        src={SortUpIcon}
                        alt={t("sortUp")}
                        className={
                          sortBy.key === "department" && sortBy.value === "asc"
                            ? "sort-icon active"
                            : "sort-icon"
                        }
                      />
                      <Image
                        src={SortDownIcon}
                        alt={t("sortDown")}
                        className={
                          sortBy.key === "department" && sortBy.value === "desc"
                            ? "sort-icon active"
                            : "sort-icon"
                        }
                      />
                    </div>
                  </div>
                </th>
                <th
                  className="table-header pointer prevent-select"
                  onClick={() => sortHandle("status")}
                >
                  <div>
                    <span>{t("status")}</span>
                    <div className="sort-container">
                      <Image
                        src={SortUpIcon}
                        alt={t("sortUp")}
                        className={
                          sortBy.key === "status" && sortBy.value === "asc"
                            ? "sort-icon active"
                            : "sort-icon"
                        }
                      />
                      <Image
                        src={SortDownIcon}
                        alt={t("sortDown")}
                        className={
                          sortBy.key === "status" && sortBy.value === "desc"
                            ? "sort-icon active"
                            : "sort-icon"
                        }
                      />
                    </div>
                  </div>
                </th>
                <th className="table-header"></th>
              </tr>
            </thead>
            <tbody>
              {userListFilter.length ? (
                userListFilter.slice(from, to).map((item, index) => (
                  <tr key={index}>
                    <td className="table-body">
                      {loading ? (
                        <Skeleton />
                      ) : item?.name || item?.lastname ? (
                        `${item.name ? item.name : "-"} ${item.lastname ? item.lastname : ""}`
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="table-body">
                      {loading ? (
                        <Skeleton />
                      ) : (
                        departmentCodeToTitle(departmentList, item.department)
                      )}
                    </td>
                    <td className="table-body">
                      {loading ? (
                        <Skeleton />
                      ) : (
                        userStatusComponent(parseInt(item.status), t)
                      )}
                    </td>
                    <td align="right" style={{ position: "relative" }}>
                      {loading ? (
                        <Skeleton />
                      ) : (
                        <button
                          className="more-btn me-2"
                          onClick={() =>
                            setShowIndex(index === showIndex ? -1 : index)
                          }
                        >
                          <Image
                            src={MoreIcon}
                            alt={t("more")}
                            className="more-icon"
                          />
                        </button>
                      )}
                      {showIndex === index && (
                        <div
                          className={
                            index + 1 === userListFilter.length &&
                            index &&
                            userListFilter.length > 5
                              ? "more-menu-container down"
                              : "more-menu-container up"
                          }
                          onMouseLeave={() => setShowIndex(-1)}
                        >
                          <div
                            className="more-menu"
                            onClick={() => {
                              setFormData({
                                id: item.id,
                                firstName: item.name,
                                lastName: item.lastname,
                                tel: item.tel,
                                email: item.email,
                                department: item.department,
                                acl: [1],
                                status: item.status,
                                username: item.username,
                                password: "",
                                confirmPassword: "",
                                errorName: "",
                                errorLastName: "",
                                errorTel: "",
                                errorEmail: "",
                                errorDepartment: "",
                                errorStatus: "",
                                errorUsername: "",
                                errorPassword: "",
                                errorConfirmPassword: "",
                              });
                              setEditModal(true);
                            }}
                          >
                            <Image
                              src={EditIcon}
                              alt={t("edit")}
                              className="more-icon me-2"
                            />
                            {t("edit")}
                          </div>
                          {userList.length > 1 ? (
                            <div
                              className="more-menu me-2"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  id: item.id,
                                });
                                setDeleteModal(true);
                              }}
                            >
                              <Image
                                src={DeleteIcon}
                                alt={t("delete")}
                                className="more-icon me-2"
                              />
                              {t("delete")}
                            </div>
                          ) : null}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="table-body text-center">
                    {t("noData")}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
        <div className="pagination-container mt-4">
          <div className="sub-pagination-container">
            <span className="paginate-text">{t("perPage")}</span>
            <select
              name="per-page"
              className="select-row mx-3"
              onChange={(e) => {
                setLimit(e.target.value);
                setEnableNext(true);
                setEnablePre(false);
                setPage(1);
                setPageInput(1);
              }}
            >
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="75">75</option>
              <option value="100">100</option>
            </select>
            <span className="paginate-text">{`${userListFilter.length ? from + 1 : 0}-${to} ${t("of")} ${
              userListFilter.length
            } ${t("items")}`}</span>
          </div>
          <div className="sub-pagination-container">
            <span
              className="paginate-text me-4 pointer"
              style={{ opacity: enablePre ? 1 : 0.5 }}
              onClick={() => (enablePre ? goFirst() : null)}
            >
              {"|<"}
            </span>
            <span
              className="paginate-text me-4 pointer"
              style={{ opacity: enablePre ? 1 : 0.5 }}
              onClick={() => (enablePre ? prev() : null)}
            >
              {"<"}
            </span>
            <input
              type="number"
              min={0}
              className="pagination-input me-2"
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onBlur={(e) => pageHandle(e.target.value)}
            />
            <span className="paginate-text">{`${t("from")} ${Math.ceil(userListFilter.length / limit)}`}</span>
            <span
              className="paginate-text ms-4 pointer"
              style={{ opacity: enableNext ? 1 : 0.5 }}
              onClick={() => (enableNext ? next() : null)}
            >
              {">"}
            </span>
            <span
              className="paginate-text ms-4 pointer"
              style={{ opacity: enableNext ? 1 : 0.5 }}
              onClick={() => (enableNext ? goLast() : null)}
            >
              {">|"}
            </span>
          </div>
        </div>
      </div>
      <Modal show={addModal} backdrop="static" centered size="lg">
        <div className="modal-header-container px-4 mt-3">
          <h4 className="mt-2 pb-3">{t("addNewUser")}</h4>
          <div className="close-modal-btn" onClick={() => clearForm("add")}>
            <Image src={CloseIcon} alt={t("close")} className="close-icon" />
          </div>
        </div>
        <div className="modal-body-container px-4">
          <div className="form-inline-container">
            <div
              className={
                formData.errorName.length
                  ? "form-group-inline error"
                  : "form-group-inline"
              }
            >
              <label className="form-label mb-0">{t("firstName")}</label>
            </div>
            <div className="form-group-inline" style={{ flex: 1 }}>
              <div
                className={formData.errorName.length ? "w-100 error" : "w-100"}
              >
                <input
                  className="form-input"
                  placeholder={t("firstName")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      firstName: e.target.value,
                      errorName: "",
                    })
                  }
                  defaultValue={formData.firstName}
                />
              </div>
            </div>
            <div style={{ flex: 0.05 }} />
            <div
              className={
                formData.errorLastName.length
                  ? "form-group-inline error"
                  : "form-group-inline"
              }
            >
              <label className="form-label text-end mb-0">
                {t("lastName")}
              </label>
            </div>
            <div className="form-group-inline" style={{ flex: 1 }}>
              <div
                className={
                  formData.errorLastName.length ? "w-100 error" : "w-100"
                }
              >
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
              </div>
            </div>
          </div>
          <div className="form-inline-container">
            <div
              className={
                formData.errorName.length
                  ? "form-group-inline error"
                  : "form-group-inline"
              }
            >
              <label className="form-label mb-0" />
            </div>
            <p className="error-text mt-1 mb-0">
              {formData.errorName.length ? formData.errorName : ""}
            </p>
            <div style={{ flex: 0.05 }} />
            <div
              className={
                formData.errorLastName.length
                  ? "form-group-inline error"
                  : "form-group-inline"
              }
            >
              <label className="form-label mb-0" />
            </div>
            <p className="error-text mt-1 mb-0">
              {formData.errorLastName.length ? formData.errorLastName : ""}
            </p>
          </div>
          <div className="form-inline-container mt-3">
            <div
              className={
                formData.errorEmail.length
                  ? "form-group-inline error"
                  : "form-group-inline"
              }
            >
              <label className="form-label mb-0">{t("email")}</label>
            </div>
            <div className="form-group-inline" style={{ flex: 1 }}>
              <div
                className={formData.errorEmail.length ? "w-100 error" : "w-100"}
              >
                <input
                  className="form-input"
                  placeholder={t("email")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value,
                      errorEmail: "",
                    })
                  }
                  defaultValue={formData.email}
                />
              </div>
            </div>
            <div style={{ flex: 0.05 }} />
            <div
              className={
                formData.errorDepartment.length
                  ? "form-group-inline error"
                  : "form-group-inline"
              }
            >
              <label className="form-label text-end mb-0">
                {t("department")}
              </label>
            </div>
            <div className="form-group-inline" style={{ flex: 1 }}>
              <div
                className={
                  formData.errorDepartment.length ? "w-100 error" : "w-100"
                }
              >
                <Select
                  options={departmentList}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      department: e ? e.value : "",
                      errorDepartment: "",
                    });
                  }}
                  classNamePrefix={"form-input"}
                  placeholder={t("department")}
                  styles={formStyle}
                  maxMenuHeight={150}
                  components={{
                    IndicatorSeparator: () => null,
                  }}
                  defaultValue={
                    formData.department
                      ? {
                          label: formData.department,
                          value: formData.department,
                        }
                      : ""
                  }
                />
              </div>
            </div>
          </div>
          <div className="form-inline-container">
            <div
              className={
                formData.errorEmail.length
                  ? "form-group-inline error"
                  : "form-group-inline"
              }
            >
              <label className="form-label mb-0" />
            </div>
            <p className="error-text mt-1 mb-0">
              {formData.errorEmail.length ? formData.errorEmail : ""}
            </p>
            <div style={{ flex: 0.05 }} />
            <div
              className={
                formData.errorDepartment.length
                  ? "form-group-inline error"
                  : "form-group-inline"
              }
            >
              <label className="form-label mb-0" />
            </div>
            <p className="error-text mt-1 mb-0">
              {formData.errorDepartment.length ? formData.errorDepartment : ""}
            </p>
          </div>
          <div className="form-inline-container mt-3">
            <div
              className={
                formData.errorStatus.length
                  ? "form-group-inline error"
                  : "form-group-inline"
              }
            >
              <label className="form-label mb-0">{t("status")}</label>
            </div>
            <div className="form-group-inline" style={{ flex: 1 }}>
              <div
                className={
                  formData.errorStatus.length ? "w-100 error" : "w-100"
                }
              >
                <Select
                  options={[
                    {
                      label: t("enable"),
                      value: "1",
                    },
                    {
                      label: t("disable"),
                      value: "0",
                    },
                  ]}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      status: e ? e.value : "",
                      errorStatus: "",
                    });
                  }}
                  classNamePrefix={"form-input"}
                  placeholder={t("status")}
                  styles={formStyle}
                  maxMenuHeight={150}
                  components={{
                    IndicatorSeparator: () => null,
                  }}
                  defaultValue={
                    formData.status
                      ? {
                          label: t("enable"),
                          value: "1",
                        }
                      : ""
                  }
                />
              </div>
            </div>
            <div style={{ flex: 0.05 }} />
            <div className={"form-group-inline"}>
              <label className="form-label mb-0" />
            </div>
            <div style={{ flex: 1 }} />
          </div>
          <div className="form-inline-container">
            <div
              className={
                formData.errorStatus.length
                  ? "form-group-inline error"
                  : "form-group-inline"
              }
            >
              <label className="form-label mb-0" />
            </div>
            <p className="error-text mt-1 mb-0">
              {formData.errorStatus.length ? formData.errorStatus : ""}
            </p>
            <div style={{ flex: 0.05 }} />
            <div className={"form-group-inline"}>
              <label className="form-label mb-0" />
            </div>
            <div style={{ flex: 1 }} />
          </div>
          <hr
            style={{
              borderTop: "1.5px solid rgba(231, 234, 240, 0.75)",
              opacity: 1,
            }}
          />
          <div className="form-inline-container mt-4">
            <div
              className={
                formData.errorUsername.length
                  ? "form-group-inline error"
                  : "form-group-inline"
              }
            >
              <label className="form-label mb-0">{t("username")}</label>
            </div>
            <div className="form-group-inline" style={{ flex: 1 }}>
              <div
                className={
                  formData.errorUsername.length ? "w-100 error" : "w-100"
                }
              >
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
                  defaultValue={formData.username}
                />
              </div>
            </div>
            <div style={{ flex: 0.05 }} />
            <div
              className={
                formData.errorPassword.length
                  ? "form-group-inline error"
                  : "form-group-inline"
              }
            >
              <label className="form-label text-end mb-0">
                {t("password")}
              </label>
            </div>
            <div className="form-group-inline" style={{ flex: 1 }}>
              <div
                className={
                  formData.errorPassword.length ? "w-100 error" : "w-100"
                }
              >
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
                  defaultValue={formData.password}
                  type={"password"}
                  autoComplete={"new-password"}
                />
              </div>
            </div>
          </div>
          <div className="form-inline-container">
            <div
              className={
                formData.errorUsername.length
                  ? "form-group-inline error"
                  : "form-group-inline"
              }
            >
              <label className="form-label mb-0" />
            </div>
            <p className="error-text mt-1 mb-0">
              {formData.errorUsername.length ? formData.errorUsername : ""}
            </p>
            <div style={{ flex: 0.05 }} />
            <div
              className={
                formData.errorPassword.length
                  ? "form-group-inline error"
                  : "form-group-inline"
              }
            >
              <label className="form-label mb-0" />
            </div>
            <p className="error-text mt-1 mb-0">
              {formData.errorPassword.length ? formData.errorPassword : ""}
            </p>
          </div>
          <div className="form-inline-container mt-3">
            <div
              className={
                formData.errorConfirmPassword.length
                  ? "form-group-inline error"
                  : "form-group-inline"
              }
            >
              <label className="form-label mb-0">{t("confirmPassword")}</label>
            </div>
            <div className="form-group-inline" style={{ flex: 1 }}>
              <div
                className={
                  formData.errorConfirmPassword.length ? "w-100 error" : "w-100"
                }
              >
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
                  defaultValue={formData.confirmPassword}
                  type={"password"}
                  autoComplete={"new-password"}
                />
              </div>
            </div>
            <div style={{ flex: 0.05 }} />
            <div className={"form-group-inline"}>
              <label className="form-label text-end mb-0" />
            </div>
            <div className="form-group-inline" style={{ flex: 1 }}></div>
          </div>
          <div className="form-inline-container">
            <div
              className={
                formData.errorConfirmPassword.length
                  ? "form-group-inline error"
                  : "form-group-inline"
              }
            >
              <label className="form-label mb-0" />
            </div>
            <p className="error-text mt-1 mb-0">
              {formData.errorConfirmPassword.length
                ? formData.errorConfirmPassword
                : ""}
            </p>
            <div style={{ flex: 0.05 }} />
            <div className={"form-group-inline"}>
              <label className="form-label mb-0" />
            </div>
            <p className="error-text mt-1 mb-0"></p>
          </div>
        </div>
        <div className="modal-footer-container mt-3 px-4">
          <button className="cancel-btn" onClick={() => clearForm("add")}>
            {t("cancel")}
          </button>
          <button className="confirm-btn" onClick={() => validateForm("add")}>
            {t("save")}
          </button>
        </div>
      </Modal>
      <Modal show={editModal} backdrop="static" centered size="lg">
        <div className="modal-header-container px-4 mt-3">
          <h4 className="mt-2 pb-3">{t("updateUser")}</h4>
          <div className="close-modal-btn" onClick={() => clearForm("edit")}>
            <Image src={CloseIcon} alt={t("close")} className="close-icon" />
          </div>
        </div>
        <div className="modal-body-container px-4">
          <div className="form-inline-container">
            <div
              className={
                formData.errorName.length
                  ? "form-group-inline error"
                  : "form-group-inline"
              }
            >
              <label className="form-label mb-0">{t("firstName")}</label>
            </div>
            <div className="form-group-inline" style={{ flex: 1 }}>
              <div
                className={formData.errorName.length ? "w-100 error" : "w-100"}
              >
                <input
                  className="form-input"
                  placeholder={t("firstName")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      firstName: e.target.value,
                      errorName: "",
                    })
                  }
                  defaultValue={formData.firstName}
                />
              </div>
            </div>
            <div style={{ flex: 0.05 }} />
            <div
              className={
                formData.errorLastName.length
                  ? "form-group-inline error"
                  : "form-group-inline"
              }
            >
              <label className="form-label text-end mb-0">
                {t("lastName")}
              </label>
            </div>
            <div className="form-group-inline" style={{ flex: 1 }}>
              <div
                className={
                  formData.errorLastName.length ? "w-100 error" : "w-100"
                }
              >
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
              </div>
            </div>
          </div>
          <div className="form-inline-container">
            <div
              className={
                formData.errorName.length
                  ? "form-group-inline error"
                  : "form-group-inline"
              }
            >
              <label className="form-label mb-0" />
            </div>
            <p className="error-text mt-1 mb-0">
              {formData.errorName.length ? formData.errorName : ""}
            </p>
            <div style={{ flex: 0.05 }} />
            <div
              className={
                formData.errorLastName.length
                  ? "form-group-inline error"
                  : "form-group-inline"
              }
            >
              <label className="form-label mb-0" />
            </div>
            <p className="error-text mt-1 mb-0">
              {formData.errorLastName.length ? formData.errorLastName : ""}
            </p>
          </div>
          <div className="form-inline-container mt-3">
            <div
              className={
                formData.errorEmail.length
                  ? "form-group-inline error"
                  : "form-group-inline"
              }
            >
              <label className="form-label mb-0">{t("email")}</label>
            </div>
            <div className="form-group-inline" style={{ flex: 1 }}>
              <div
                className={formData.errorEmail.length ? "w-100 error" : "w-100"}
              >
                <input
                  className="form-input"
                  placeholder={t("email")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value,
                      errorEmail: "",
                    })
                  }
                  defaultValue={formData.email}
                />
              </div>
            </div>
            <div style={{ flex: 0.05 }} />
            <div
              className={
                formData.errorDepartment.length
                  ? "form-group-inline error"
                  : "form-group-inline"
              }
            >
              <label className="form-label text-end mb-0">
                {t("department")}
              </label>
            </div>
            <div className="form-group-inline" style={{ flex: 1 }}>
              <div
                className={
                  formData.errorDepartment.length ? "w-100 error" : "w-100"
                }
              >
                <Select
                  options={departmentList}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      department: e ? e.value : "",
                      errorDepartment: "",
                    });
                  }}
                  classNamePrefix={"form-input"}
                  placeholder={t("department")}
                  styles={formStyle}
                  maxMenuHeight={150}
                  components={{
                    IndicatorSeparator: () => null,
                  }}
                  defaultValue={
                    formData.department
                      ? {
                          label: departmentCodeToTitle(
                            departmentList,
                            formData.department
                          ),
                          value: formData.department,
                        }
                      : ""
                  }
                />
              </div>
            </div>
          </div>
          <div className="form-inline-container">
            <div
              className={
                formData.errorEmail.length
                  ? "form-group-inline error"
                  : "form-group-inline"
              }
            >
              <label className="form-label mb-0" />
            </div>
            <p className="error-text mt-1 mb-0">
              {formData.errorEmail.length ? formData.errorEmail : ""}
            </p>
            <div style={{ flex: 0.05 }} />
            <div
              className={
                formData.errorDepartment.length
                  ? "form-group-inline error"
                  : "form-group-inline"
              }
            >
              <label className="form-label mb-0" />
            </div>
            <p className="error-text mt-1 mb-0">
              {formData.errorDepartment.length ? formData.errorDepartment : ""}
            </p>
          </div>
          <div className="form-inline-container mt-3">
            <div
              className={
                formData.errorStatus.length
                  ? "form-group-inline error"
                  : "form-group-inline"
              }
            >
              <label className="form-label mb-0">{t("status")}</label>
            </div>
            <div className="form-group-inline" style={{ flex: 1 }}>
              <div
                className={
                  formData.errorStatus.length ? "w-100 error" : "w-100"
                }
              >
                <Select
                  options={[
                    {
                      label: t("enable"),
                      value: "1",
                    },
                    {
                      label: t("disable"),
                      value: "0",
                    },
                  ]}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      status: e ? e.value : "",
                      errorStatus: "",
                    });
                  }}
                  classNamePrefix={"form-input"}
                  placeholder={t("status")}
                  styles={formStyle}
                  maxMenuHeight={150}
                  components={{
                    IndicatorSeparator: () => null,
                  }}
                  defaultValue={
                    formData.status
                      ? {
                          label:
                            formData.status === 1 ? t("enable") : t("disable"),
                          value: formData.status.toString(),
                        }
                      : ""
                  }
                />
              </div>
            </div>
            <div style={{ flex: 0.05 }} />
            <div className={"form-group-inline"}>
              <label className="form-label mb-0" />
            </div>
            <div style={{ flex: 1 }} />
          </div>
          <div className="form-inline-container">
            <div
              className={
                formData.errorStatus.length
                  ? "form-group-inline error"
                  : "form-group-inline"
              }
            >
              <label className="form-label mb-0" />
            </div>
            <p className="error-text mt-1 mb-0">
              {formData.errorStatus.length ? formData.errorStatus : ""}
            </p>
            <div style={{ flex: 0.05 }} />
            <div className={"form-group-inline"}>
              <label className="form-label mb-0" />
            </div>
            <div style={{ flex: 1 }} />
          </div>
          <hr
            style={{
              borderTop: "1.5px solid rgba(231, 234, 240, 0.75)",
              opacity: 1,
            }}
          />
          <div className="form-inline-container mt-4">
            <div
              className={
                formData.errorUsername.length
                  ? "form-group-inline error"
                  : "form-group-inline"
              }
            >
              <label className="form-label mb-0">{t("username")}</label>
            </div>
            <div className="form-group-inline" style={{ flex: 1 }}>
              <div
                className={
                  formData.errorUsername.length ? "w-100 error" : "w-100"
                }
              >
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
                  defaultValue={formData.username}
                />
              </div>
            </div>
            <div style={{ flex: 0.05 }} />
            <div
              className={
                formData.errorPassword.length
                  ? "form-group-inline error"
                  : "form-group-inline"
              }
            >
              <label className="form-label text-end mb-0">
                {t("password")}
              </label>
            </div>
            <div className="form-group-inline" style={{ flex: 1 }}>
              <div
                className={
                  formData.errorPassword.length ? "w-100 error" : "w-100"
                }
              >
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
                  defaultValue={formData.password}
                  type={"password"}
                  autoComplete={"new-password"}
                />
              </div>
            </div>
          </div>
          <div className="form-inline-container">
            <div
              className={
                formData.errorUsername.length
                  ? "form-group-inline error"
                  : "form-group-inline"
              }
            >
              <label className="form-label mb-0" />
            </div>
            <p className="error-text mt-1 mb-0">
              {formData.errorUsername.length ? formData.errorUsername : ""}
            </p>
            <div style={{ flex: 0.05 }} />
            <div
              className={
                formData.errorPassword.length
                  ? "form-group-inline error"
                  : "form-group-inline"
              }
            >
              <label className="form-label mb-0" />
            </div>
            <p className="error-text mt-1 mb-0">
              {formData.errorPassword.length ? formData.errorPassword : ""}
            </p>
          </div>
          <div className="form-inline-container mt-3">
            <div
              className={
                formData.errorConfirmPassword.length
                  ? "form-group-inline error"
                  : "form-group-inline"
              }
            >
              <label className="form-label mb-0">{t("confirmPassword")}</label>
            </div>
            <div className="form-group-inline" style={{ flex: 1 }}>
              <div
                className={
                  formData.errorConfirmPassword.length ? "w-100 error" : "w-100"
                }
              >
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
                  defaultValue={formData.confirmPassword}
                  type={"password"}
                  autoComplete={"new-password"}
                />
              </div>
            </div>
            <div style={{ flex: 0.05 }} />
            <div className={"form-group-inline"}>
              <label className="form-label text-end mb-0" />
            </div>
            <div className="form-group-inline" style={{ flex: 1 }}></div>
          </div>
          <div className="form-inline-container">
            <div
              className={
                formData.errorConfirmPassword.length
                  ? "form-group-inline error"
                  : "form-group-inline"
              }
            >
              <label className="form-label mb-0" />
            </div>
            <p className="error-text mt-1 mb-0">
              {formData.errorConfirmPassword.length
                ? formData.errorConfirmPassword
                : ""}
            </p>
            <div style={{ flex: 0.05 }} />
            <div className={"form-group-inline"}>
              <label className="form-label mb-0" />
            </div>
            <p className="error-text mt-1 mb-0"></p>
          </div>
        </div>
        <div className="modal-footer-container mt-3 px-4">
          <button className="cancel-btn" onClick={() => clearForm("edit")}>
            {t("cancel")}
          </button>
          <button className="confirm-btn" onClick={() => validateForm("edit")}>
            {t("save")}
          </button>
        </div>
      </Modal>
      <Modal
        show={deleteModal}
        backdrop="static"
        centered
        size="sm"
        className="delete-modal"
      >
        <div className="modal-delete-header p-4">
          <div>
            <Image src={WarningIcon} alt={"delete"} className="delete-icon" />
          </div>
          <h4 className="delete-title mt-4">{t("deleteUserTitle")}</h4>
          <p className="delete-message mb-0">{t("deleteUserText")}</p>
        </div>
        <div className="modal-body-container">
          <div className="form-group-input">
            <div className={deleteValue.error.length ? "error" : ""}>
              <label className="form-label">{t("deleteLabel")}</label>
              <input
                className="form-input"
                placeholder={t("delete")}
                onChange={(e) =>
                  setDeleteValue({
                    ...deleteValue,
                    value: e.target.value,
                    error: "",
                  })
                }
              />
              {deleteValue.error.length ? (
                <p className="error-text mt-1 mb-0">{deleteValue.error}</p>
              ) : null}
            </div>
          </div>
        </div>
        <div className="modal-footer-container delete-footer mt-3">
          <button className="cancel-btn" onClick={() => clearForm("delete")}>
            {t("denyDelete")}
          </button>
          <button
            className="confirm-delete-btn"
            onClick={() => deleteUserHandle()}
          >
            {t("confirmDelete")}
          </button>
        </div>
      </Modal>
      <LoadingModal loading={loadingModal} />
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
    </div>
  );
};

export default Admin;
