import React, { useEffect, useState, useRef } from "react";
import Nav from "../components/Nav";
import { useTranslation } from "react-i18next";
import moment from "moment";
import "moment/locale/th";
import {
  capitalizeFirst,
  departmentCodeToTitle,
  departmentTitleToCode,
  fileIconHandle,
  getFileSizeFromUrl,
  getFileTypeFromName,
  numberWithCommas,
  statusComponent,
  toBuddhistYear,
  validateToken,
} from "../utils/utils";
import { Image, Table, Modal } from "react-bootstrap";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { th } from "date-fns/locale/th";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import InternalIcon from "../assets/images/internal.png";
import ExternalIcon from "../assets/images/external.png";
import ClearIcon from "../assets/images/clear.png";
import MoreIcon from "../assets/images/more.png";
import ViewIcon from "../assets/images/view.png";
import EditIcon from "../assets/images/edit.png";
import DeleteIcon from "../assets/images/bin.png";
import SortUpIcon from "../assets/images/sort_up.png";
import SortDownIcon from "../assets/images/sort_down.png";
import DownloadIcon from "../assets/images/download.png";
import CloseIcon from "../assets/images/close.png";
import WarningIcon from "../assets/images/delete.png";
import SuccessIcon from "../assets/images/success.png";
import DragDropUpload from "../components/DragDropUpload";
import { useNavigate } from "react-router-dom";
import {
  addDocumentApi,
  deleteDocumentApi,
  departmentListApi,
  documentListApi,
  updateDocumentApi,
  uploadFileApi,
} from "../api/api";
import LoadingModal from "../components/LoadingModal";

const menuStyle = {
  control: (baseStyles) => ({
    ...baseStyles,
    border: 0,
    boxShadow: "none",
    fontSize: "16px",
    height: "38px",
    minHeight: "38px",
    fontFamily: "Kanit-Light",
    color: "#16192c",
    padding: "0px 0 2px 0",
  }),
  singleValue: (baseStyles) => ({
    ...baseStyles,
    color: "#16192c",
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
    color: "#16192c",
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
    color: "#16192c",
    padding: "0px 0 2px 0",
  }),
  singleValue: (baseStyles) => ({
    ...baseStyles,
    color: "#16192c",
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
    color: "#16192c",
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

const Documents = () => {
  const { t, i18n } = useTranslation();

  const navigate = useNavigate();

  moment.locale(i18n.language);
  registerLocale("th", th);

  const [loading, setLoading] = useState(true);
  const [loadingModal, setLoadingModal] = useState(false);
  const [documentList, setDocumentList] = useState([]);
  const [documentListFilter, setDocumentListFilter] = useState([]);
  const [showIndex, setShowIndex] = useState(-1);
  const [sortBy, setSortBy] = useState({
    key: "date",
    value: "asc",
  });
  const [keyword, setKeyword] = useState("");
  const [filterDate, setFilterDate] = useState(null);
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState(1);
  const [limit, setLimit] = useState(100);
  const [enableNext, setEnableNext] = useState(false);
  const [enablePre, setEnablePre] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    receivedDate: null,
    documentType: "ภายนอก",
    documentNo: "",
    year: toBuddhistYear(moment(), "YYYY"),
    registrationNo: "",
    status: "รับทราบ - ดำเนินการ",
    title: "",
    detail: "",
    sender: "",
    receiver: "",
    receiverType: "ภายใน",
    errorReceivedDate: "",
    errorDocumentType: "",
    errorDocumentNo: "",
    errorYear: "",
    errorRegistrationNo: "",
    errorStatus: "",
    errorTitle: "",
    errorDetail: "",
    errorSender: "",
    errorReceiver: "",
  });
  const [modalPage, setModalPage] = useState(1);
  const [files, setFiles] = useState([]);
  const [filesForm, setFilesForm] = useState([]);
  const [deleteValue, setDeleteValue] = useState({
    value: "",
    error: "",
  });
  const [uploadProcess, setUploadProcess] = useState(0);
  const [documentIndex, setDocumentIndex] = useState(0);
  const [successModal, setSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [successTitle, setSuccessTitle] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorTitle, setErrorTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [typeTotal, setTypeTotal] = useState({
    internal: 0,
    external: 0,
  });
  const [departmentList, setDepartmentList] = useState([]);

  const filter = useRef({
    date: null,
    status: "",
    type: "",
  });
  const typeRef = useRef(null);
  const statusRef = useRef(null);
  const sortByRef = useRef({
    key: "date",
    value: "asc",
  });
  const documentTypeAddRef = useRef(null);
  const documentYearAddRef = useRef(null);
  const documentStatusAddRef = useRef(null);

  const from = (page - 1) * limit;
  const to = Math.min(page * limit, documentListFilter.length);

  useEffect(() => {
    (async () => {
      try {
        const token = validateToken();

        if (!token) {
          navigate("/login");
        }

        const res = await documentListApi(token, limit, page);

        const result = res.data.message ? res.data.message : [];
        const total = res.data.message?.length ? res.data.message.length : 0;

        const documentArr = result.sort((a, b) => {
          if (
            moment(a.receivedDate).valueOf() < moment(b.receivedDate).valueOf()
          ) {
            return -1;
          } else if (
            moment(a.receivedDate).valueOf() > moment(b.receivedDate).valueOf()
          ) {
            return 1;
          }

          return 0;
        });

        setDocumentListFilter(documentArr);
        setDocumentList(documentArr);

        if (total / limit > 1) {
          setEnableNext(true);
        }

        const internal = documentArr.filter((item) => {
          return item.subjectType.toLowerCase() === "ภายใน";
        });

        const external = documentArr.filter((item) => {
          return item.subjectType.toLowerCase() === "ภายนอก";
        });

        setTypeTotal({
          internal: internal.length,
          external: external.length,
        });

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

    const documentArr = documentListFilter.sort((a, b) => {
      switch (true) {
        case key === "documentNo":
          if (sortByRef.current.value === "asc") {
            if (a.subjectCode > b.subjectCode) {
              return 1;
            } else if (a.subjectCode < b.subjectCode) {
              return -1;
            }

            return 0;
          } else {
            if (a.subjectCode > b.subjectCode) {
              return -1;
            } else if (a.subjectCode < b.subjectCode) {
              return 1;
            }

            return 0;
          }
        case key === "year":
          if (sortByRef.current.value === "asc") {
            if (a.year > b.year) {
              return 1;
            } else if (a.year < b.year) {
              return -1;
            }

            return 0;
          } else {
            if (a.year > b.year) {
              return -1;
            } else if (a.year < b.year) {
              return 1;
            }

            return 0;
          }
        case key === "documentType":
          if (sortByRef.current.value === "asc") {
            if (a.subjectType > b.subjectType) {
              return 1;
            } else if (a.subjectType < b.subjectType) {
              return -1;
            }

            return 0;
          } else {
            if (a.subjectType > b.subjectType) {
              return -1;
            } else if (a.subjectType < b.subjectType) {
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
            if (
              moment(a.receivedDate).valueOf() >
              moment(b.receivedDate).valueOf()
            ) {
              return 1;
            } else if (
              moment(a.receivedDate).valueOf() <
              moment(b.receivedDate).valueOf()
            ) {
              return -1;
            }

            return 0;
          } else {
            if (
              moment(a.receivedDate).valueOf() >
              moment(b.receivedDate).valueOf()
            ) {
              return -1;
            } else if (
              moment(a.receivedDate).valueOf() <
              moment(b.receivedDate).valueOf()
            ) {
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
    setDocumentListFilter(documentArr);
  };

  const goFirst = () => {
    setPage(1);
    setPageInput(1);
    setEnablePre(false);
    setEnableNext(true);
  };

  const goLast = () => {
    setPage(Math.ceil(documentListFilter.length / limit));
    setPageInput(Math.ceil(documentListFilter.length / limit));
    setEnableNext(false);
    setEnablePre(true);
  };

  const next = () => {
    setEnablePre(true);
    setPage((prevValue) => prevValue + 1);
    setPageInput((prevValue) => prevValue + 1);

    const lastPage = Math.min((page + 1) * limit, documentListFilter.length);

    if (lastPage !== documentListFilter.length) {
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
      } else if (
        Math.ceil(documentListFilter.length / limit) > parseInt(value)
      ) {
        setPage(value);
        setPageInput(value);
        setEnableNext(true);
        setEnablePre(true);
      } else {
        setPage(Math.ceil(documentListFilter.length / limit));
        setPageInput(Math.ceil(documentListFilter.length / limit));
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
      const result = documentList.filter((item) => {
        return (
          (item.subjectCode.toLowerCase().indexOf(val.toLowerCase()) >= 0 ||
            item.subjectTitle.toLowerCase().indexOf(val.toLowerCase()) >= 0 ||
            item.sender
              .toLowerCase()
              .indexOf(departmentTitleToCode(departmentList, val)) >= 0 ||
            item.receiver
              .toLowerCase()
              .indexOf(departmentTitleToCode(departmentList, val)) >= 0) &&
          (filter.current.type
            ? item.subjectType.toLowerCase() ===
              filter.current.type.toLowerCase()
            : true) &&
          (filter.current.status
            ? item.status.toLowerCase() === filter.current.status.toLowerCase()
            : true) &&
          (filter.current.date
            ? moment(item.updatedDate).format("MM/YYYY") ===
              moment(filter.current.date).format("MM/YYYY")
            : true)
        );
      });

      setPage(1);
      setEnablePre(false);

      setDocumentListFilter(result);

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
      const result = documentList.filter((item) => {
        return (
          (item.subjectCode.toLowerCase().indexOf(keyword.toLowerCase()) >= 0 ||
            item.subjectTitle.toLowerCase().indexOf(keyword.toLowerCase()) >=
              0 ||
            item.sender
              .toLowerCase()
              .indexOf(departmentTitleToCode(departmentList, keyword)) >= 0 ||
            item.receiver
              .toLowerCase()
              .indexOf(departmentTitleToCode(departmentList, keyword)) >= 0) &&
          (filter.current.type
            ? item.subjectType.toLowerCase() ===
              filter.current.type.toLowerCase()
            : true) &&
          (filter.current.status
            ? item.status.toLowerCase() === filter.current.status.toLowerCase()
            : true) &&
          (filter.current.date
            ? moment(item.updatedDate).format("MM/YYYY") ===
              moment(filter.current.date).format("MM/YYYY")
            : true)
        );
      });

      setPage(1);
      setEnablePre(false);

      setDocumentListFilter(result);

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
      date: null,
      status: "",
      type: "",
    };

    typeRef.current.clearValue();
    statusRef.current.clearValue();

    setKeyword("");
    setFilterDate(null);
    setPage(1);
    setEnablePre(false);

    setDocumentListFilter(documentList);
  };

  const clearForm = (type) => {
    if (type === "add") {
      setAddModal(false);
    } else if (type === "edit") {
      setEditModal(false);
    } else if (type === "delete") {
      setDeleteModal(false);
    } else {
      setViewModal(false);
    }

    setFormData({
      receivedDate: null,
      documentType: "ภายนอก",
      documentNo: "",
      year: toBuddhistYear(moment(), "YYYY"),
      registrationNo: "",
      status: "รับทราบ - ดำเนินการ",
      title: "",
      detail: "",
      sender: "",
      receiver: "",
      errorReceivedDate: "",
      errorDocumentType: "",
      errorDocumentNo: "",
      errorYear: "",
      errorRegistrationNo: "",
      errorStatus: "",
      errorTitle: "",
      errorDetail: "",
      errorSender: "",
      errorReceiver: "",
    });
    setFiles([]);
    setFilesForm([]);
    setDeleteValue({ value: "", error: "" });
    setModalPage(1);
  };

  const validateForm = (type) => {
    if (
      !formData.receivedDate ||
      !formData.documentType ||
      !formData.documentNo ||
      !formData.year ||
      !formData.registrationNo ||
      !formData.status ||
      !formData.title ||
      !formData.detail ||
      !formData.sender ||
      !formData.receiver
    ) {
      setFormData({
        ...formData,
        errorReceivedDate: formData.receivedDate
          ? ""
          : t("errorEmptyReceivedDate"),
        errorDocumentType: formData.documentType
          ? ""
          : t("errorEmptyDocumentType"),
        errorDocumentNo: formData.documentNo ? "" : t("errorEmptyDocumentNo"),
        errorYear: formData.year ? "" : t("errorEmptyYear"),
        errorRegistrationNo: formData.registrationNo
          ? ""
          : t("errorEmptyRegistrationNo"),
        errorStatus: formData.status ? "" : t("errorEmptyStatus"),
        errorTitle: formData.title ? "" : t("errorEmptyTitle"),
        errorDetail: formData.detail ? "" : t("errorEmptyDetail"),
        errorSender: formData.sender ? "" : t("errorEmptySender"),
        errorReceiver: formData.receiver ? "" : t("errorEmptyReceiver"),
      });

      return;
    }

    if (type === "add") {
      setModalPage(2);
    } else {
      updateHandle();
    }
  };

  const uploadFileHandle = async () => {
    try {
      const token = validateToken();

      if (!token) {
        navigate("/login");
      }

      setLoadingModal(true);

      await addDocumentApi(token, formData);
      const id = await fetchDocumentList();

      if (files.length) {
        if (!id) {
          throw "uploadError";
        }

        await uploadFileApi(token, id, files);
      }

      await fetchDocumentList();

      setLoadingModal(false);

      setSuccessModal(true);
      setSuccessTitle(t("addDocumentSuccessTitle"));
      setSuccessMessage(t("addDocumentSuccessMessage"));
      clearForm("add");
    } catch (e) {
      setLoadingModal(false);

      if (e === "uploadError") {
        setErrorModal(true);
        setErrorTitle(
          "(" + e.response.status + ")\n" + " " + t("uploadFileErrorTitle")
        );
        setErrorMessage(t("uploadFileErrorMessage"));
        clearForm("add");

        return;
      }

      if (e.response) {
        if (e.response.status === 403) {
          setErrorModal(true);
          setErrorTitle(
            "(" + e.response.status + ")\n" + " " + t("uploadFileErrorTitle")
          );
          setErrorMessage(t("uploadFileErrorMessage"));
          clearForm("add");
        } else if (e.response.data.error === "the document already exists") {
          setModalPage(1);
          setFormData({
            ...formData,
            errorDocumentNo: t("errorDuplicateDocumentNo"),
          });
        } else {
          setErrorModal(true);
          setErrorTitle(t("addDocumentErrorTitle"));
          setErrorMessage(t("addDocumentErrorMessage"));
          clearForm("add");
        }
      } else {
        setErrorModal(true);
        setErrorTitle(t("addDocumentErrorTitle"));
        setErrorMessage(t("addDocumentErrorMessage"));
        clearForm("add");
      }
    }
  };

  const updateHandle = async () => {
    try {
      const token = validateToken();
      if (!token) {
        setLoadingModal(false);
        navigate("/login");
      }
      setLoadingModal(true);

      const fileArr = [];

      if (filesForm.length) {
        filesForm.map((item) => {
          fileArr.push({
            name: item.name,
            url: item.url,
          });

          return item;
        });
      }

      await updateDocumentApi(token, formData, fileArr);

      if (files.length) {
        await uploadFileApi(token, formData.id, files);
      }

      await fetchDocumentList();

      setSuccessModal(true);
      setSuccessTitle(t("updateDocumentSuccessTitle"));
      setSuccessMessage(t("updateDocumentSuccessMessage"));
    } catch (e) {
      setErrorModal(true);

      if (e.response.status === 403) {
        setErrorTitle(
          "(" + e.response.status + ")\n" + t("updateDocumentErrorTitle")
        );
      } else {
        setErrorTitle(t("updateDocumentErrorTitle"));
      }
      setErrorMessage(t("updateDocumentErrorMessage"));
    } finally {
      setLoadingModal(false);
      clearForm("edit");
    }
  };

  const confirmDelete = async () => {
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

      await deleteDocumentApi(token, formData.id);
      await fetchDocumentList();

      setSuccessModal(true);
      setSuccessTitle(t("deleteDocumentSuccessTitle"));
      setSuccessMessage(t("deleteDocumentSuccessMessage"));

      clearForm("delete");
    } catch {
      setErrorModal(true);
      setErrorTitle(t("deleteDocumentErrorTitle"));
      setErrorMessage(t("deleteDocumentErrorMessage"));

      clearForm("delete");
    } finally {
      setLoadingModal(false);
    }
  };

  const fetchDocumentList = async () => {
    try {
      const token = validateToken();

      if (!token) {
        navigate("/login");
      }

      setLoading(true);

      const res = await documentListApi(token, limit, page);

      const result = res.data.message;
      const total = res.data.message.length;

      const documentArr = result.sort((a, b) => {
        if (
          moment(a.receivedDate).valueOf() < moment(b.receivedDate).valueOf()
        ) {
          return -1;
        } else if (
          moment(a.receivedDate).valueOf() > moment(b.receivedDate).valueOf()
        ) {
          return 1;
        }

        return 0;
      });

      setDocumentListFilter(documentArr);
      setDocumentList(documentArr);

      sortByRef.current = {
        key: "date",
        value: "asc",
      };

      setSortBy({
        key: "date",
        value: "asc",
      });

      if (total / limit > 1) {
        setEnableNext(true);
      }

      setPage(1);

      const internal = result.filter((item) => {
        return item.subjectType.toLowerCase() === "ภายใน";
      });

      const external = result.filter((item) => {
        return item.subjectType.toLowerCase() === "ภายนอก";
      });

      setTypeTotal({
        internal: internal.length,
        external: external.length,
      });

      if (total) {
        return result[total - 1].id;
      } else {
        return false;
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const fileSizeHandle = async (id, files, type) => {
    try {
      const fileArr = await Promise.all(
        files.map(async (item) => {
          const { size, link } = await getFileSizeFromUrl(item.url, id);

          item.size = size;
          item.link = link;

          return item;
        })
      );

      setFilesForm(fileArr);
    } catch {
      setFilesForm(files);
    } finally {
      if (type === "edit") {
        setEditModal(true);
      } else {
        setViewModal(true);
      }
    }
  };

  return (
    <div className="main">
      <Nav page={"document"} />
      <h3 className="title mt-4">
        {t("summaryReport")} :{" "}
        <span className="title-date">
          {toBuddhistYear(moment(), "MM/YYYY")}
        </span>
      </h3>
      <div className="summary-card-container mt-3">
        <div className="summary-card">
          <div style={{ flex: 1 }}>
            <span className="summary-card-title">{t("internalDocument")}</span>
            <p className="summary-card-value mb-0">
              {numberWithCommas(typeTotal.internal)}
            </p>
          </div>
          <div
            className="summary-icon-container"
            style={{ background: "#3fbeee" }}
          >
            <Image
              src={InternalIcon}
              className="summary-icon"
              alt={t("internalDocument")}
            />
          </div>
        </div>
        <div className="summary-card">
          <div style={{ flex: 1 }}>
            <span className="summary-card-title">{t("externalDocument")}</span>
            <p className="summary-card-value mb-0">
              {numberWithCommas(typeTotal.external)}
            </p>
          </div>
          <div
            className="summary-icon-container"
            style={{ background: "#ec744a" }}
          >
            <Image
              src={ExternalIcon}
              className="summary-icon"
              alt={t("externalDocument")}
            />
          </div>
        </div>
      </div>
      <div className="card-container">
        <h5 className="card-title mb-0">{t("documentList")}</h5>
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
            <label className="filter-label">{t("month")}</label>
            <DatePicker
              className="filter-input"
              selected={filterDate}
              onChange={(date) => {
                filter.current.date = date;
                setFilterDate(date);
                filterHandle();
              }}
              placeholderText={t("month")}
              showMonthYearPicker
              dateFormat="MM/YYYY"
              locale={i18n.language}
            />
          </div>
          <div className="filter-input-container">
            <label className="filter-label">{t("type")}</label>
            <Select
              ref={typeRef}
              options={[
                {
                  label: t("internal"),
                  value: "ภายใน",
                },
                {
                  label: t("external"),
                  value: "ภายนอก",
                },
              ]}
              onChange={(e) => {
                filter.current = {
                  ...filter.current,
                  type: e ? e.value : "",
                };
                filterHandle();
              }}
              placeholder={t("type")}
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
                  label: t("รับทราบแล้ว"),
                  value: "รับทราบแล้ว",
                },
                {
                  label: t("รับทราบ - ดำเนินการ"),
                  value: "รับทราบ - ดำเนินการ",
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
              {t("addDocument")}
            </button>
          </div>
        </div>
        <div className="table-container mt-4">
          <Table className="w-100 align-middle mb-0">
            <thead className="sticky-top">
              <tr>
                <th
                  className="table-header pointer prevent-select"
                  onClick={() => sortHandle("date")}
                  style={{ minWidth: "120px" }}
                >
                  <div>
                    <span>{t("date")}</span>
                    <div className="sort-container">
                      <Image
                        src={SortUpIcon}
                        alt={t("sortUp")}
                        className={
                          sortBy.key === "date" && sortBy.value === "asc"
                            ? "sort-icon active"
                            : "sort-icon"
                        }
                      />
                      <Image
                        src={SortDownIcon}
                        alt={t("sortDown")}
                        className={
                          sortBy.key === "date" && sortBy.value === "desc"
                            ? "sort-icon active"
                            : "sort-icon"
                        }
                      />
                    </div>
                  </div>
                </th>
                <th
                  className="table-header pointer prevent-select"
                  onClick={() => sortHandle("documentNo")}
                  style={{ minWidth: "120px" }}
                >
                  <div>
                    <span>{t("documentNo")}</span>
                    <div className="sort-container">
                      <Image
                        src={SortUpIcon}
                        alt={t("sortUp")}
                        className={
                          sortBy.key === "documentNo" && sortBy.value === "asc"
                            ? "sort-icon active"
                            : "sort-icon"
                        }
                      />
                      <Image
                        src={SortDownIcon}
                        alt={t("sortDown")}
                        className={
                          sortBy.key === "documentNo" && sortBy.value === "desc"
                            ? "sort-icon active"
                            : "sort-icon"
                        }
                      />
                    </div>
                  </div>
                </th>
                <th
                  className="table-header prevent-select"
                  onClick={() => sortHandle("year")}
                  style={{ minWidth: "70px" }}
                >
                  <div>
                    <span>{t("year")}</span>
                    <div className="sort-container">
                      <Image
                        src={SortUpIcon}
                        alt={t("sortUp")}
                        className={
                          sortBy.key === "year" && sortBy.value === "asc"
                            ? "sort-icon active"
                            : "sort-icon"
                        }
                      />
                      <Image
                        src={SortDownIcon}
                        alt={t("sortDown")}
                        className={
                          sortBy.key === "year" && sortBy.value === "desc"
                            ? "sort-icon active"
                            : "sort-icon"
                        }
                      />
                    </div>
                  </div>
                </th>
                <th
                  className="table-header pointer prevent-select"
                  onClick={() => sortHandle("documentType")}
                  style={{ minWidth: "150px" }}
                >
                  <div>
                    <span>{t("documentType")}</span>
                    <div className="sort-container">
                      <Image
                        src={SortUpIcon}
                        alt={t("sortUp")}
                        className={
                          sortBy.key === "documentType" &&
                          sortBy.value === "asc"
                            ? "sort-icon active"
                            : "sort-icon"
                        }
                      />
                      <Image
                        src={SortDownIcon}
                        alt={t("sortDown")}
                        className={
                          sortBy.key === "documentType" &&
                          sortBy.value === "desc"
                            ? "sort-icon active"
                            : "sort-icon"
                        }
                      />
                    </div>
                  </div>
                </th>
                <th
                  className="table-header prevent-select"
                  style={{ width: "20vw", minWidth: "200px" }}
                >
                  {t("title")}
                </th>
                <th
                  className="table-header prevent-select"
                  style={{ minWidth: "120px" }}
                >
                  {t("sender")}
                </th>
                <th
                  className="table-header prevent-select"
                  style={{ minWidth: "120px" }}
                >
                  {t("receiver")}
                </th>
                <th
                  className="table-header pointer prevent-select"
                  onClick={() => sortHandle("status")}
                  style={{ minWidth: "200px" }}
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
                <th className="table-header" style={{ minWidth: "60px" }}></th>
              </tr>
            </thead>
            <tbody>
              {documentListFilter.length ? (
                documentListFilter.slice(from, to).map((item, index) => (
                  <tr key={index}>
                    <td className="table-body">
                      {loading ? (
                        <Skeleton />
                      ) : item?.receivedDate ? (
                        moment(item.receivedDate).format("DD/MM/YYYY")
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="table-body">
                      {loading ? (
                        <Skeleton />
                      ) : item?.subjectCode ? (
                        <span
                          className="pointer"
                          style={{
                            color: "#3fbeee",
                            fontFamily: "Kanit-Regular",
                          }}
                          onClick={() => {
                            setFormData({
                              ...formData,
                              id: item.id,
                              receivedDate: item.receivedDate,
                              documentType: item.subjectType,
                              documentNo: item.subjectCode,
                              year: item.year,
                              registrationNo: item.regReceipt,
                              status: item.status,
                              title: item.subjectTitle,
                              detail: item.subjectDetail,
                              sender: item.sender,
                              receiver: item.receiver,
                            });
                            setDocumentIndex(index + 1);
                            fileSizeHandle(item.id, item.files, "view");
                          }}
                        >
                          {item.subjectCode}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="table-body">
                      {loading ? <Skeleton /> : item?.year ? item.year : "-"}
                    </td>
                    <td className="table-body">
                      {loading ? (
                        <Skeleton />
                      ) : item?.subjectType ? (
                        capitalizeFirst(item.subjectType)
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="table-body" style={{ minWidth: "200px" }}>
                      <p className="clip-text mb-0">
                        {loading ? (
                          <Skeleton />
                        ) : item?.subjectTitle ? (
                          item.subjectTitle
                        ) : (
                          "-"
                        )}
                      </p>
                    </td>
                    <td className="table-body">
                      {loading ? (
                        <Skeleton />
                      ) : item?.sender ? (
                        departmentCodeToTitle(departmentList, item.sender)
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="table-body">
                      {loading ? (
                        <Skeleton />
                      ) : item?.receiver ? (
                        departmentCodeToTitle(departmentList, item.receiver)
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="table-body">
                      {loading ? (
                        <Skeleton />
                      ) : item?.status ? (
                        statusComponent(item.status)
                      ) : (
                        "-"
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
                            index + 1 === documentListFilter.length &&
                            index &&
                            documentListFilter.length > 5
                              ? "more-menu-container down"
                              : "more-menu-container up"
                          }
                          onMouseLeave={() => setShowIndex(-1)}
                        >
                          <div
                            className="more-menu"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                id: item.id,
                                receivedDate: item.receivedDate,
                                documentType: item.subjectType,
                                documentNo: item.subjectCode,
                                year: item.year,
                                registrationNo: item.regReceipt,
                                status: item.status,
                                title: item.subjectTitle,
                                detail: item.subjectDetail,
                                sender: item.sender,
                                receiver: item.receiver,
                              });
                              fileSizeHandle(item.id, item.files, "view");
                            }}
                          >
                            <Image
                              src={ViewIcon}
                              alt={t("view")}
                              className="more-icon me-2"
                            />
                            {t("view")}
                          </div>
                          <div
                            className="more-menu"
                            onClick={() => {
                              setFormData({
                                id: item.id,
                                receivedDate: new Date(item.receivedDate),
                                documentType: item.subjectType,
                                documentNo: item.subjectCode,
                                year: item.year,
                                registrationNo: item.regReceipt,
                                status: item.status,
                                title: item.subjectTitle,
                                detail: item.subjectDetail,
                                sender: item.sender,
                                receiver: item.receiver,
                                errorReceivedDate: "",
                                errorDocumentType: "",
                                errorDocumentNo: "",
                                errorYear: "",
                                errorRegistrationNo: "",
                                errorStatus: "",
                                errorTitle: "",
                                errorDetail: "",
                                errorSender: "",
                                errorReceiver: "",
                              });
                              setDocumentIndex(index + 1);
                              fileSizeHandle(item.id, item.files, "edit");
                            }}
                          >
                            <Image
                              src={EditIcon}
                              alt={t("edit")}
                              className="more-icon me-2"
                            />
                            {t("edit")}
                          </div>
                          <div
                            className="more-menu me-2"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                id: item.id,
                                documentNo: item.subjectCode,
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
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="table-body text-center">
                    {t("noData")}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
        <div className="pagination-container mt-4">
          <div className="sub-pagination-container d-none d-lg-flex">
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
              defaultValue={limit}
            >
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="75">75</option>
              <option value="100">100</option>
            </select>
            <span className="paginate-text">{`${documentListFilter.length ? from + 1 : 0}-${to} ${t("of")} ${
              documentListFilter.length
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
            <span className="paginate-text">{`${t("from")} ${Math.ceil(documentListFilter.length / limit)}`}</span>
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
          <h4 className="mt-2 pb-3">
            {modalPage === 1 ? t("addDocumentTitle") : t("fileList")}
          </h4>
          <span className="d-none d-md-block">
            {t("modalDate")} {toBuddhistYear(moment(), "DD-MM-YYYY HH:mm")}
          </span>
          <div className="close-modal-btn" onClick={() => clearForm("add")}>
            <Image src={CloseIcon} alt={t("close")} className="close-icon" />
          </div>
        </div>
        {modalPage === 1 ? (
          <div className="modal-body-container px-4">
            <div className="form-inline-container">
              <div
                className={
                  formData.errorReceivedDate.length
                    ? "form-group-inline error"
                    : "form-group-inline"
                }
              >
                <label className="form-label mb-lg-0">
                  {t("receivedDate")}
                </label>
              </div>
              <div className="form-group-inline mb-lg-0" style={{ flex: 1 }}>
                <div
                  className={
                    formData.errorReceivedDate.length ? "w-100 error" : "w-100"
                  }
                >
                  <DatePicker
                    className="form-input"
                    selected={formData.receivedDate}
                    onChange={(date) =>
                      setFormData({
                        ...formData,
                        receivedDate: date,
                        errorReceivedDate: "",
                      })
                    }
                    placeholderText={t("receivedDate")}
                    dateFormat="dd/MM/YYYY"
                    locale={i18n.language}
                  />
                </div>
              </div>
              <div className="form-group-inline mb-3 mb-lg-0 d-flex d-lg-none">
                {formData.errorReceivedDate.length ? (
                  <p className="error-text mt-1 mb-0" style={{ flex: 1 }}>
                    {formData.errorReceivedDate}
                  </p>
                ) : (
                  ""
                )}
              </div>
              <div className="d-none d-lg-flex" style={{ flex: 0.05 }} />
              <div
                className={
                  formData.errorDocumentType.length
                    ? "form-group-inline error"
                    : "form-group-inline"
                }
              >
                <label className="form-label text-lg-end mb-lg-0">
                  {t("documentType")}
                </label>
              </div>
              <div className="form-group-inline" style={{ flex: 1 }}>
                <div
                  className={
                    formData.errorDocumentType.length ? "w-100 error" : "w-100"
                  }
                >
                  <Select
                    ref={documentTypeAddRef}
                    options={[
                      {
                        label: t("internal"),
                        value: "ภายใน",
                      },
                      {
                        label: t("external"),
                        value: "ภายนอก",
                      },
                    ]}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        documentType: e ? e.value : "",
                        sender: "",
                        errorDocumentType: "",
                      });
                    }}
                    classNamePrefix={"form-input"}
                    placeholder={t("documentType")}
                    styles={formStyle}
                    maxMenuHeight={150}
                    components={{
                      IndicatorSeparator: () => null,
                    }}
                    defaultValue={
                      formData.documentType
                        ? {
                            label: formData.documentType,
                            value: formData.documentType,
                          }
                        : ""
                    }
                    isSearchable={false}
                  />
                </div>
              </div>
              <div className="form-group-inline mb-3 mb-lg-0 d-flex d-lg-none">
                {formData.errorDocumentType.length ? (
                  <p className="error-text mt-1 mb-0" style={{ flex: 1 }}>
                    {formData.errorDocumentType}
                  </p>
                ) : (
                  ""
                )}
              </div>
            </div>
            <div className="form-inline-container d-none d-lg-flex">
              <div
                className={
                  formData.errorReceivedDate.length
                    ? "form-group-inline error"
                    : "form-group-inline"
                }
              >
                <label className="form-label mb-0" />
              </div>
              <p className="error-text mt-0 mt-lg-0 mb-0">
                {formData.errorReceivedDate.length
                  ? formData.errorReceivedDate
                  : ""}
              </p>
              <div className="d-none d-lg-flex" style={{ flex: 0.05 }} />
              <div
                className={
                  formData.errorDocumentType.length
                    ? "form-group-inline error"
                    : "form-group-inline"
                }
              >
                <label className="form-label mb-0" />
              </div>
              <p className="error-text mt-0 mt-lg-0 mb-0">
                {formData.errorDocumentType.length
                  ? formData.errorDocumentType
                  : ""}
              </p>
            </div>
            <div className="form-inline-container mt-0 mt-lg-3">
              <div
                className={
                  formData.errorDocumentNo.length
                    ? "form-group-inline error"
                    : "form-group-inline"
                }
              >
                <label className="form-label mb-lg-0">{t("documentNo")}</label>
              </div>
              <div className="form-group-inline mb-0" style={{ flex: 1 }}>
                <div
                  className={
                    formData.errorDocumentNo.length ? "w-100 error" : "w-100"
                  }
                >
                  <input
                    className="form-input"
                    placeholder={t("documentNo")}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        documentNo: e.target.value,
                        errorDocumentNo: "",
                      })
                    }
                    defaultValue={formData.documentNo}
                  />
                </div>
              </div>
              <div className="form-group-inline mb-3 mb-lg-0 d-flex d-lg-none">
                {formData.errorDocumentNo.length ? (
                  <p className="error-text mt-1 mb-0" style={{ flex: 1 }}>
                    {formData.errorDocumentNo}
                  </p>
                ) : (
                  ""
                )}
              </div>
              <div className="d-none d-lg-flex" style={{ flex: 0.05 }} />
              <div
                className={
                  formData.errorYear.length
                    ? "form-group-inline error"
                    : "form-group-inline"
                }
              >
                <label className="form-label text-lg-end mb-lg-0">
                  {t("yearBE")}
                </label>
              </div>
              <div className="form-group-inline mb-0" style={{ flex: 1 }}>
                <div
                  className={
                    formData.errorYear.length ? "w-100 error" : "w-100"
                  }
                >
                  <Select
                    ref={documentYearAddRef}
                    options={[
                      {
                        label: "2566",
                        value: "2566",
                      },
                      {
                        label: "2567",
                        value: "2567",
                      },
                      {
                        label: "2568",
                        value: "2568",
                      },
                      {
                        label: "2569",
                        value: "2569",
                      },
                    ]}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        year: e ? e.value : "",
                        errorYear: "",
                      });
                    }}
                    classNamePrefix={"form-input"}
                    placeholder={t("yearBE")}
                    styles={formStyle}
                    maxMenuHeight={150}
                    components={{
                      IndicatorSeparator: () => null,
                    }}
                    defaultValue={
                      formData.year
                        ? {
                            label: formData.year,
                            value: formData.year,
                          }
                        : ""
                    }
                    isSearchable={false}
                  />
                </div>
              </div>
              <div className="form-group-inline mb-3 mb-lg-0 d-flex d-lg-none">
                {formData.errorYear.length ? (
                  <p className="error-text mt-1 mb-0" style={{ flex: 1 }}>
                    {formData.errorYear}
                  </p>
                ) : (
                  ""
                )}
              </div>
            </div>
            <div className="form-inline-container d-none d-lg-flex">
              <div
                className={
                  formData.errorDocumentNo.length
                    ? "form-group-inline error"
                    : "form-group-inline"
                }
              >
                <label className="form-label mb-0" />
              </div>
              <p className="error-text mt-0 mt-lg-0 mb-0">
                {formData.errorDocumentNo.length
                  ? formData.errorDocumentNo
                  : ""}
              </p>
              <div className="d-none d-lg-flex" style={{ flex: 0.05 }} />
              <div
                className={
                  formData.errorYear.length
                    ? "form-group-inline error"
                    : "form-group-inline"
                }
              >
                <label className="form-label mb-0" />
              </div>
              <p className="error-text mt-0 mt-lg-0 mb-0">
                {formData.errorYear.length ? formData.errorYear : ""}
              </p>
            </div>
            <div className="form-inline-container mt-0 mt-lg-3">
              <div
                className={
                  formData.errorRegistrationNo.length
                    ? "form-group-inline error"
                    : "form-group-inline"
                }
              >
                <label className="form-label mb-lg-0">
                  {t("registrationNo")}
                </label>
              </div>
              <div className="form-group-inline mb-0" style={{ flex: 1 }}>
                <div
                  className={
                    formData.errorRegistrationNo.length
                      ? "w-100 error"
                      : "w-100"
                  }
                >
                  <input
                    className="form-input"
                    placeholder={t("registrationNo")}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        registrationNo: e.target.value,
                        errorRegistrationNo: "",
                      })
                    }
                    defaultValue={formData.registrationNo}
                  />
                </div>
              </div>
              <div className="form-group-inline mb-3 mb-lg-0 d-flex d-lg-none">
                {formData.errorRegistrationNo.length ? (
                  <p className="error-text mt-1 mb-0" style={{ flex: 1 }}>
                    {formData.errorRegistrationNo}
                  </p>
                ) : (
                  ""
                )}
              </div>
              <div className="d-none d-lg-flex" style={{ flex: 0.05 }} />
              <div
                className={
                  formData.errorStatus.length
                    ? "form-group-inline error"
                    : "form-group-inline"
                }
              >
                <label className="form-label text-lg-end mb-lg-0">
                  {t("status")}
                </label>
              </div>
              <div className="form-group-inline" style={{ flex: 1 }}>
                <div
                  className={
                    formData.errorStatus.length ? "w-100 error" : "w-100"
                  }
                >
                  <Select
                    ref={documentStatusAddRef}
                    options={[
                      {
                        label: t("รับทราบแล้ว"),
                        value: "รับทราบแล้ว",
                      },
                      {
                        label: t("รับทราบ - ดำเนินการ"),
                        value: "รับทราบ - ดำเนินการ",
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
                            label: t(formData.status),
                            value: formData.status,
                          }
                        : ""
                    }
                    isSearchable={false}
                  />
                </div>
              </div>
              <div className="form-group-inline mb-3 mb-lg-0 d-flex d-lg-none">
                {formData.errorStatus.length ? (
                  <p className="error-text mt-1 mb-0" style={{ flex: 1 }}>
                    {formData.errorStatus}
                  </p>
                ) : (
                  ""
                )}
              </div>
            </div>
            <div className="form-inline-container d-none d-lg-flex">
              <div
                className={
                  formData.errorRegistrationNo.length
                    ? "form-group-inline error"
                    : "form-group-inline"
                }
              >
                <label className="form-label mb-0" />
              </div>
              <p className="error-text mt-0 mt-lg-0 mb-0">
                {formData.errorRegistrationNo.length
                  ? formData.errorRegistrationNo
                  : ""}
              </p>
              <div className="d-none d-lg-flex" style={{ flex: 0.05 }} />
              <div
                className={
                  formData.errorStatus.length
                    ? "form-group-inline error"
                    : "form-group-inline"
                }
              >
                <label className="form-label mb-0" />
              </div>
              <p className="error-text mt-0 mt-lg-0 mb-0">
                {formData.errorStatus.length ? formData.errorStatus : ""}
              </p>
            </div>
            <div className="form-inline-container mt-0 mt-lg-3">
              <div
                className={
                  formData.errorSender.length
                    ? "form-group-inline error"
                    : "form-group-inline"
                }
              >
                <label className="form-label mb-lg-0">{t("sender")}</label>
              </div>
              <div className="form-group-inline" style={{ flex: 1 }}>
                <div
                  className={
                    formData.errorSender.length ? "w-100 error" : "w-100"
                  }
                >
                  {formData.documentType === "ภายนอก" ? (
                    <input
                      className="form-input"
                      placeholder={t("sender")}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sender: e.target.value,
                          errorSender: "",
                        })
                      }
                      defaultValue={formData.sender}
                    />
                  ) : (
                    <Select
                      options={departmentList}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          sender: e ? e.value : "",
                          errorSender: "",
                        });
                      }}
                      classNamePrefix={"form-input"}
                      placeholder={t("sender")}
                      styles={formStyle}
                      maxMenuHeight={150}
                      components={{
                        IndicatorSeparator: () => null,
                      }}
                      defaultValue={
                        formData.sender
                          ? {
                              label: departmentCodeToTitle(
                                departmentList,
                                formData.sender
                              ),
                              value: formData.sender,
                            }
                          : ""
                      }
                    />
                  )}
                </div>
              </div>
              <div className="form-group-inline mb-3 mb-lg-0 d-flex d-lg-none">
                {formData.errorSender.length ? (
                  <p className="error-text mt-1 mb-0" style={{ flex: 1 }}>
                    {formData.errorSender}
                  </p>
                ) : (
                  ""
                )}
              </div>
              <div className="d-none d-lg-flex" style={{ flex: 0.05 }} />
              <div
                className={
                  formData.errorStatus.length
                    ? "form-group-inline error"
                    : "form-group-inline"
                }
              >
                <label className="form-label text-lg-end mb-lg-0">
                  {t("receiver")}
                </label>
              </div>
              <div className="form-group-inline" style={{ flex: 1 }}>
                <div
                  className={
                    formData.errorReceiver.length ? "w-100 error" : "w-100"
                  }
                >
                  <Select
                    options={departmentList}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        receiver: e ? e.value : "",
                        errorReceiver: "",
                      });
                    }}
                    classNamePrefix={"form-input"}
                    placeholder={t("receiver")}
                    styles={formStyle}
                    maxMenuHeight={150}
                    components={{
                      IndicatorSeparator: () => null,
                    }}
                    defaultValue={
                      formData.receiver
                        ? {
                            label: departmentCodeToTitle(
                              departmentList,
                              formData.receiver
                            ),
                            value: formData.receiver,
                          }
                        : ""
                    }
                  />
                </div>
              </div>
              <div className="form-group-inline mb-3 mb-lg-0 d-flex d-lg-none">
                {formData.errorReceiver.length ? (
                  <p className="error-text mt-1 mb-0" style={{ flex: 1 }}>
                    {formData.errorReceiver}
                  </p>
                ) : (
                  ""
                )}
              </div>
            </div>
            <div className="form-inline-container d-none d-lg-flex">
              <div
                className={
                  formData.errorSender.length
                    ? "form-group-inline error"
                    : "form-group-inline"
                }
              >
                <label className="form-label mb-0" />
              </div>
              <p className="error-text mt-0 mt-lg-0 mb-0">
                {formData.errorSender.length ? formData.errorSender : ""}
              </p>
              <div className="d-none d-lg-flex" style={{ flex: 0.05 }} />
              <div
                className={
                  formData.errorReceiver.length
                    ? "form-group-inline error"
                    : "form-group-inline"
                }
              >
                <label className="form-label mb-0" />
              </div>
              <p className="error-text mt-0 mt-lg-0 mb-0">
                {formData.errorReceiver.length ? formData.errorReceiver : ""}
              </p>
            </div>
            <div className="form-inline-container mt-0 mt-lg-5">
              <div
                className={
                  formData.errorTitle.length
                    ? "form-group-inline error"
                    : "form-group-inline"
                }
              >
                <label className="form-label mb-lg-0">{t("title")}</label>
              </div>
              <div className="form-group-inline document-title-container">
                <div
                  className={
                    formData.errorTitle.length ? "w-100 error" : "w-100"
                  }
                >
                  <input
                    className="form-input"
                    placeholder={t("title")}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        title: e.target.value,
                        errorTitle: "",
                      })
                    }
                    defaultValue={formData.title}
                  />
                </div>
              </div>
              <div className="form-group-inline mb-3 mb-lg-0 d-flex d-lg-none">
                {formData.errorTitle.length ? (
                  <p className="error-text mt-1 mb-0" style={{ flex: 1 }}>
                    {formData.errorTitle}
                  </p>
                ) : (
                  ""
                )}
              </div>
              <div className="d-none d-lg-flex" style={{ flex: 0.05 }} />
            </div>
            <div className="form-inline-container d-none d-lg-flex">
              <div
                className={
                  formData.errorTitle.length
                    ? "form-group-inline error"
                    : "form-group-inline"
                }
              >
                <label className="form-label mb-0" />
              </div>
              <p className="error-text mt-0 mt-lg-0 mb-0">
                {formData.errorTitle.length ? formData.errorTitle : ""}
              </p>
            </div>
            <div className="form-inline-container mt-0 mt-lg-3">
              <div
                className={
                  formData.errorDetail.length
                    ? "form-group-inline error"
                    : "form-group-inline"
                }
              >
                <label className="form-label mb-lg-0">{t("detail")}</label>
              </div>
              <div
                className={formData.errorDetail.length ? "error" : ""}
                style={{ flex: 1 }}
              >
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder={t("detail")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      detail: e.target.value,
                      errorDetail: "",
                    })
                  }
                  defaultValue={formData.detail}
                ></textarea>
              </div>
              <div className="form-group-inline mb-3 mb-lg-0 d-flex d-lg-none">
                {formData.errorDetail.length ? (
                  <p className="error-text mt-1 mb-0" style={{ flex: 1 }}>
                    {formData.errorDetail}
                  </p>
                ) : (
                  ""
                )}
              </div>
            </div>
            <div className="form-inline-container d-none d-lg-flex">
              <div
                className={
                  formData.errorDetail.length
                    ? "form-group-inline error"
                    : "form-group-inline"
                }
              >
                <label className="form-label mb-0" />
              </div>
              <p className="error-text mt-0 mt-lg-0 mb-0">
                {formData.errorDetail.length ? formData.errorDetail : ""}
              </p>
            </div>
          </div>
        ) : (
          <DragDropUpload
            onFilesSelected={setFiles}
            filesForm={[]}
            setFilesForm={setFilesForm}
            id={formData.id}
            setLoadingModal={setLoadingModal}
            uploadProcess={uploadProcess}
            setUploadProcess={setUploadProcess}
          />
        )}
        {modalPage === 1 ? (
          <div className="modal-footer-container mt-3 px-4">
            <button className="cancel-btn" onClick={() => clearForm("add")}>
              {t("cancel")}
            </button>
            <button className="confirm-btn" onClick={() => validateForm("add")}>
              {t("next")}
            </button>
          </div>
        ) : (
          <div className="modal-footer-container mt-3 px-4">
            <button className="cancel-btn" onClick={() => setModalPage(1)}>
              {t("back")}
            </button>
            <button className="confirm-btn" onClick={() => uploadFileHandle()}>
              {t("save")}
            </button>
          </div>
        )}
      </Modal>
      <Modal show={editModal} backdrop="static" centered size="lg">
        <div className="modal-header-container px-4 mt-3 pb-2">
          <h4 className="mt-2 pb-3">
            {modalPage === 1
              ? t("editDocument") +
                " #" +
                String(documentIndex).padStart(4, "0")
              : t("fileList")}
          </h4>
          <span className="d-none d-md-block">
            {t("modalDate")} {toBuddhistYear(moment(), "DD-MM-YYYY HH:mm")}
          </span>
          <div className="close-modal-btn" onClick={() => clearForm("edit")}>
            <Image src={CloseIcon} alt={t("close")} className="close-icon" />
          </div>
        </div>
        <div className="modal-body-container px-4">
          <ul className="nav nav-tabs mb-3">
            <li className="nav-item">
              <span
                className={
                  modalPage === 1
                    ? "nav-link active pointer tab-text"
                    : "nav-link pointer tab-text"
                }
                onClick={() => setModalPage(1)}
              >
                {t("information")}
              </span>
            </li>
            <li className="nav-item">
              <span
                className={
                  modalPage === 2
                    ? "nav-link active pointer tab-text"
                    : "nav-link pointer tab-text"
                }
                onClick={() => setModalPage(2)}
              >
                {t("files")}
              </span>
            </li>
          </ul>
        </div>
        {modalPage === 1 ? (
          <div className="modal-body-container px-4">
            <div className="form-inline-container">
              <div
                className={
                  formData.errorReceivedDate.length
                    ? "form-group-inline error"
                    : "form-group-inline"
                }
              >
                <label className="form-label mb-lg-0">
                  {t("receivedDate")}
                </label>
              </div>
              <div className="form-group-inline mb-lg-0" style={{ flex: 1 }}>
                <div
                  className={
                    formData.errorReceivedDate.length ? "w-100 error" : "w-100"
                  }
                >
                  <DatePicker
                    className="form-input"
                    selected={formData.receivedDate}
                    onChange={(date) =>
                      setFormData({
                        ...formData,
                        receivedDate: date,
                        errorReceivedDate: "",
                      })
                    }
                    placeholderText={t("receivedDate")}
                    dateFormat="dd/MM/YYYY"
                    locale={i18n.language}
                  />
                </div>
              </div>
              <div className="form-group-inline mb-3 mb-lg-0 d-flex d-lg-none">
                {formData.errorReceivedDate.length ? (
                  <p className="error-text mt-1 mb-0" style={{ flex: 1 }}>
                    {formData.errorReceivedDate}
                  </p>
                ) : (
                  ""
                )}
              </div>
              <div className="d-none d-lg-flex" style={{ flex: 0.05 }} />
              <div
                className={
                  formData.errorDocumentType.length
                    ? "form-group-inline error"
                    : "form-group-inline"
                }
              >
                <label className="form-label text-lg-end mb-lg-0">
                  {t("documentType")}
                </label>
              </div>
              <div className="form-group-inline" style={{ flex: 1 }}>
                <div
                  className={
                    formData.errorDocumentType.length ? "w-100 error" : "w-100"
                  }
                >
                  <Select
                    ref={documentTypeAddRef}
                    options={[
                      {
                        label: t("internal"),
                        value: "ภายใน",
                      },
                      {
                        label: t("external"),
                        value: "ภายนอก",
                      },
                    ]}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        documentType: e ? e.value : "",
                        sender: "",
                        errorDocumentType: "",
                      });
                    }}
                    classNamePrefix={"form-input"}
                    placeholder={t("documentType")}
                    styles={formStyle}
                    maxMenuHeight={150}
                    components={{
                      IndicatorSeparator: () => null,
                    }}
                    defaultValue={
                      formData.documentType
                        ? {
                            label: formData.documentType,
                            value: formData.documentType,
                          }
                        : ""
                    }
                    isSearchable={false}
                  />
                </div>
              </div>
              <div className="form-group-inline mb-3 mb-lg-0 d-flex d-lg-none">
                {formData.errorDocumentType.length ? (
                  <p className="error-text mt-1 mb-0" style={{ flex: 1 }}>
                    {formData.errorDocumentType}
                  </p>
                ) : (
                  ""
                )}
              </div>
            </div>
            <div className="form-inline-container d-none d-lg-flex">
              <div
                className={
                  formData.errorReceivedDate.length
                    ? "form-group-inline error"
                    : "form-group-inline"
                }
              >
                <label className="form-label mb-0" />
              </div>
              <p className="error-text mt-0 mt-lg-0 mb-0">
                {formData.errorReceivedDate.length
                  ? formData.errorReceivedDate
                  : ""}
              </p>
              <div className="d-none d-lg-flex" style={{ flex: 0.05 }} />
              <div
                className={
                  formData.errorDocumentType.length
                    ? "form-group-inline error"
                    : "form-group-inline"
                }
              >
                <label className="form-label mb-0" />
              </div>
              <p className="error-text mt-0 mt-lg-0 mb-0">
                {formData.errorDocumentType.length
                  ? formData.errorDocumentType
                  : ""}
              </p>
            </div>
            <div className="form-inline-container mt-0 mt-lg-3">
              <div
                className={
                  formData.errorDocumentNo.length
                    ? "form-group-inline error"
                    : "form-group-inline"
                }
              >
                <label className="form-label mb-lg-0">{t("documentNo")}</label>
              </div>
              <div className="form-group-inline mb-0" style={{ flex: 1 }}>
                <div
                  className={
                    formData.errorDocumentNo.length ? "w-100 error" : "w-100"
                  }
                >
                  <input
                    className="form-input"
                    placeholder={t("documentNo")}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        documentNo: e.target.value,
                        errorDocumentNo: "",
                      })
                    }
                    defaultValue={formData.documentNo}
                  />
                </div>
              </div>
              <div className="form-group-inline mb-3 mb-lg-0 d-flex d-lg-none">
                {formData.errorDocumentNo.length ? (
                  <p className="error-text mt-1 mb-0" style={{ flex: 1 }}>
                    {formData.errorDocumentNo}
                  </p>
                ) : (
                  ""
                )}
              </div>
              <div className="d-none d-lg-flex" style={{ flex: 0.05 }} />
              <div
                className={
                  formData.errorYear.length
                    ? "form-group-inline error"
                    : "form-group-inline"
                }
              >
                <label className="form-label text-lg-end mb-lg-0">
                  {t("yearBE")}
                </label>
              </div>
              <div className="form-group-inline mb-0" style={{ flex: 1 }}>
                <div
                  className={
                    formData.errorYear.length ? "w-100 error" : "w-100"
                  }
                >
                  <Select
                    ref={documentYearAddRef}
                    options={[
                      {
                        label: "2566",
                        value: "2566",
                      },
                      {
                        label: "2567",
                        value: "2567",
                      },
                      {
                        label: "2568",
                        value: "2568",
                      },
                      {
                        label: "2569",
                        value: "2569",
                      },
                    ]}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        year: e ? e.value : "",
                        errorYear: "",
                      });
                    }}
                    classNamePrefix={"form-input"}
                    placeholder={t("yearBE")}
                    styles={formStyle}
                    maxMenuHeight={150}
                    components={{
                      IndicatorSeparator: () => null,
                    }}
                    defaultValue={
                      formData.year
                        ? {
                            label: formData.year,
                            value: formData.year,
                          }
                        : ""
                    }
                    isSearchable={false}
                  />
                </div>
              </div>
              <div className="form-group-inline mb-3 mb-lg-0 d-flex d-lg-none">
                {formData.errorYear.length ? (
                  <p className="error-text mt-1 mb-0" style={{ flex: 1 }}>
                    {formData.errorYear}
                  </p>
                ) : (
                  ""
                )}
              </div>
            </div>
            <div className="form-inline-container d-none d-lg-flex">
              <div
                className={
                  formData.errorDocumentNo.length
                    ? "form-group-inline error"
                    : "form-group-inline"
                }
              >
                <label className="form-label mb-0" />
              </div>
              <p className="error-text mt-0 mt-lg-0 mb-0">
                {formData.errorDocumentNo.length
                  ? formData.errorDocumentNo
                  : ""}
              </p>
              <div className="d-none d-lg-flex" style={{ flex: 0.05 }} />
              <div
                className={
                  formData.errorYear.length
                    ? "form-group-inline error"
                    : "form-group-inline"
                }
              >
                <label className="form-label mb-0" />
              </div>
              <p className="error-text mt-0 mt-lg-0 mb-0">
                {formData.errorYear.length ? formData.errorYear : ""}
              </p>
            </div>
            <div className="form-inline-container mt-0 mt-lg-3">
              <div
                className={
                  formData.errorRegistrationNo.length
                    ? "form-group-inline error"
                    : "form-group-inline"
                }
              >
                <label className="form-label mb-lg-0">
                  {t("registrationNo")}
                </label>
              </div>
              <div className="form-group-inline mb-0" style={{ flex: 1 }}>
                <div
                  className={
                    formData.errorRegistrationNo.length
                      ? "w-100 error"
                      : "w-100"
                  }
                >
                  <input
                    className="form-input"
                    placeholder={t("registrationNo")}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        registrationNo: e.target.value,
                        errorRegistrationNo: "",
                      })
                    }
                    defaultValue={formData.registrationNo}
                  />
                </div>
              </div>
              <div className="form-group-inline mb-3 mb-lg-0 d-flex d-lg-none">
                {formData.errorRegistrationNo.length ? (
                  <p className="error-text mt-1 mb-0" style={{ flex: 1 }}>
                    {formData.errorRegistrationNo}
                  </p>
                ) : (
                  ""
                )}
              </div>
              <div className="d-none d-lg-flex" style={{ flex: 0.05 }} />
              <div
                className={
                  formData.errorStatus.length
                    ? "form-group-inline error"
                    : "form-group-inline"
                }
              >
                <label className="form-label text-lg-end mb-lg-0">
                  {t("status")}
                </label>
              </div>
              <div className="form-group-inline" style={{ flex: 1 }}>
                <div
                  className={
                    formData.errorStatus.length ? "w-100 error" : "w-100"
                  }
                >
                  <Select
                    ref={documentStatusAddRef}
                    options={[
                      {
                        label: t("รับทราบแล้ว"),
                        value: "รับทราบแล้ว",
                      },
                      {
                        label: t("รับทราบ - ดำเนินการ"),
                        value: "รับทราบ - ดำเนินการ",
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
                            label: t(formData.status),
                            value: formData.status,
                          }
                        : ""
                    }
                    isSearchable={false}
                  />
                </div>
              </div>
              <div className="form-group-inline mb-3 mb-lg-0 d-flex d-lg-none">
                {formData.errorStatus.length ? (
                  <p className="error-text mt-1 mb-0" style={{ flex: 1 }}>
                    {formData.errorStatus}
                  </p>
                ) : (
                  ""
                )}
              </div>
            </div>
            <div className="form-inline-container d-none d-lg-flex">
              <div
                className={
                  formData.errorRegistrationNo.length
                    ? "form-group-inline error"
                    : "form-group-inline"
                }
              >
                <label className="form-label mb-0" />
              </div>
              <p className="error-text mt-0 mt-lg-0 mb-0">
                {formData.errorRegistrationNo.length
                  ? formData.errorRegistrationNo
                  : ""}
              </p>
              <div className="d-none d-lg-flex" style={{ flex: 0.05 }} />
              <div
                className={
                  formData.errorStatus.length
                    ? "form-group-inline error"
                    : "form-group-inline"
                }
              >
                <label className="form-label mb-0" />
              </div>
              <p className="error-text mt-0 mt-lg-0 mb-0">
                {formData.errorStatus.length ? formData.errorStatus : ""}
              </p>
            </div>
            <div className="form-inline-container mt-0 mt-lg-3">
              <div
                className={
                  formData.errorSender.length
                    ? "form-group-inline error"
                    : "form-group-inline"
                }
              >
                <label className="form-label mb-lg-0">{t("sender")}</label>
              </div>
              <div className="form-group-inline" style={{ flex: 1 }}>
                <div
                  className={
                    formData.errorSender.length ? "w-100 error" : "w-100"
                  }
                >
                  {formData.documentType === "ภายนอก" ? (
                    <input
                      className="form-input"
                      placeholder={t("sender")}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sender: e.target.value,
                          errorSender: "",
                        })
                      }
                      defaultValue={formData.sender}
                    />
                  ) : (
                    <Select
                      options={departmentList}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          sender: e ? e.value : "",
                          errorSender: "",
                        });
                      }}
                      classNamePrefix={"form-input"}
                      placeholder={t("sender")}
                      styles={formStyle}
                      maxMenuHeight={150}
                      components={{
                        IndicatorSeparator: () => null,
                      }}
                      defaultValue={
                        formData.sender
                          ? {
                              label: departmentCodeToTitle(
                                departmentList,
                                formData.sender
                              ),
                              value: formData.sender,
                            }
                          : ""
                      }
                    />
                  )}
                </div>
              </div>
              <div className="form-group-inline mb-3 mb-lg-0 d-flex d-lg-none">
                {formData.errorSender.length ? (
                  <p className="error-text mt-1 mb-0" style={{ flex: 1 }}>
                    {formData.errorSender}
                  </p>
                ) : (
                  ""
                )}
              </div>
              <div className="d-none d-lg-flex" style={{ flex: 0.05 }} />
              <div
                className={
                  formData.errorStatus.length
                    ? "form-group-inline error"
                    : "form-group-inline"
                }
              >
                <label className="form-label text-lg-end mb-lg-0">
                  {t("receiver")}
                </label>
              </div>
              <div className="form-group-inline" style={{ flex: 1 }}>
                <div
                  className={
                    formData.errorReceiver.length ? "w-100 error" : "w-100"
                  }
                >
                  <Select
                    options={departmentList}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        receiver: e ? e.value : "",
                        errorReceiver: "",
                      });
                    }}
                    classNamePrefix={"form-input"}
                    placeholder={t("receiver")}
                    styles={formStyle}
                    maxMenuHeight={150}
                    components={{
                      IndicatorSeparator: () => null,
                    }}
                    defaultValue={
                      formData.receiver
                        ? {
                            label: departmentCodeToTitle(
                              departmentList,
                              formData.receiver
                            ),
                            value: formData.receiver,
                          }
                        : ""
                    }
                  />
                </div>
              </div>
              <div className="form-group-inline mb-3 mb-lg-0 d-flex d-lg-none">
                {formData.errorReceiver.length ? (
                  <p className="error-text mt-1 mb-0" style={{ flex: 1 }}>
                    {formData.errorReceiver}
                  </p>
                ) : (
                  ""
                )}
              </div>
            </div>
            <div className="form-inline-container d-none d-lg-flex">
              <div
                className={
                  formData.errorSender.length
                    ? "form-group-inline error"
                    : "form-group-inline"
                }
              >
                <label className="form-label mb-0" />
              </div>
              <p className="error-text mt-0 mt-lg-0 mb-0">
                {formData.errorSender.length ? formData.errorSender : ""}
              </p>
              <div className="d-none d-lg-flex" style={{ flex: 0.05 }} />
              <div
                className={
                  formData.errorReceiver.length
                    ? "form-group-inline error"
                    : "form-group-inline"
                }
              >
                <label className="form-label mb-0" />
              </div>
              <p className="error-text mt-0 mt-lg-0 mb-0">
                {formData.errorReceiver.length ? formData.errorReceiver : ""}
              </p>
            </div>
            <div className="form-inline-container mt-0 mt-lg-5">
              <div
                className={
                  formData.errorTitle.length
                    ? "form-group-inline error"
                    : "form-group-inline"
                }
              >
                <label className="form-label mb-lg-0">{t("title")}</label>
              </div>
              <div className="form-group-inline document-title-container">
                <div
                  className={
                    formData.errorTitle.length ? "w-100 error" : "w-100"
                  }
                >
                  <input
                    className="form-input"
                    placeholder={t("title")}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        title: e.target.value,
                        errorTitle: "",
                      })
                    }
                    defaultValue={formData.title}
                  />
                </div>
              </div>
              <div className="form-group-inline mb-3 mb-lg-0 d-flex d-lg-none">
                {formData.errorTitle.length ? (
                  <p className="error-text mt-1 mb-0" style={{ flex: 1 }}>
                    {formData.errorTitle}
                  </p>
                ) : (
                  ""
                )}
              </div>
              <div className="d-none d-lg-flex" style={{ flex: 0.05 }} />
            </div>
            <div className="form-inline-container d-none d-lg-flex">
              <div
                className={
                  formData.errorTitle.length
                    ? "form-group-inline error"
                    : "form-group-inline"
                }
              >
                <label className="form-label mb-0" />
              </div>
              <p className="error-text mt-0 mt-lg-0 mb-0">
                {formData.errorTitle.length ? formData.errorTitle : ""}
              </p>
            </div>
            <div className="form-inline-container mt-0 mt-lg-3">
              <div
                className={
                  formData.errorDetail.length
                    ? "form-group-inline error"
                    : "form-group-inline"
                }
              >
                <label className="form-label mb-lg-0">{t("detail")}</label>
              </div>
              <div
                className={formData.errorDetail.length ? "error" : ""}
                style={{ flex: 1 }}
              >
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder={t("detail")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      detail: e.target.value,
                      errorDetail: "",
                    })
                  }
                  defaultValue={formData.detail}
                ></textarea>
              </div>
              <div className="form-group-inline mb-3 mb-lg-0 d-flex d-lg-none">
                {formData.errorDetail.length ? (
                  <p className="error-text mt-1 mb-0" style={{ flex: 1 }}>
                    {formData.errorDetail}
                  </p>
                ) : (
                  ""
                )}
              </div>
            </div>
            <div className="form-inline-container d-none d-lg-flex">
              <div
                className={
                  formData.errorDetail.length
                    ? "form-group-inline error"
                    : "form-group-inline"
                }
              >
                <label className="form-label mb-0" />
              </div>
              <p className="error-text mt-0 mt-lg-0 mb-0">
                {formData.errorDetail.length ? formData.errorDetail : ""}
              </p>
            </div>
          </div>
        ) : (
          <DragDropUpload
            onFilesSelected={setFiles}
            filesForm={filesForm}
            setFilesForm={setFilesForm}
            id={formData.id}
            setLoadingModal={setLoadingModal}
            uploadProcess={uploadProcess}
            setUploadProcess={setUploadProcess}
          />
        )}
        <div className="modal-footer-container mt-3 px-4">
          <button className="cancel-btn" onClick={() => clearForm("edit")}>
            {t("cancel")}
          </button>
          <button className="confirm-btn" onClick={() => validateForm("edit")}>
            {t("save")}
          </button>
        </div>
      </Modal>
      <Modal show={viewModal} backdrop="static" centered size="lg">
        <div className="modal-header-container px-4 mt-3">
          <h4 className="mt-2 pb-3">
            {modalPage === 1
              ? t("viewDocument") +
                " #" +
                String(documentIndex).padStart(4, "0")
              : t("fileList")}
          </h4>
          <span className="d-none d-md-block">
            {t("modalDate")} {toBuddhistYear(moment(), "DD-MM-YYYY HH:mm")}
          </span>
          <div className="close-modal-btn" onClick={() => clearForm("view")}>
            <Image src={CloseIcon} alt={t("close")} className="close-icon" />
          </div>
        </div>
        <div className="modal-body-container px-4">
          <div className="d-none d-lg-block">
            <div className="form-inline-container">
              <div className="form-group-inline">
                <label className="form-label mb-0">{t("receivedDate")}</label>
              </div>
              <div className="form-group-inline" style={{ flex: 1 }}>
                <div className={"w-100"}>
                  <p className="info-value mb-0">
                    {moment(formData.receivedDate).format("DD-MM-YYYY")}
                  </p>
                </div>
              </div>
              <div className="d-none d-lg-flex" style={{ flex: 0.05 }} />
              <div className="form-group-inline">
                <label className="form-label text-lg-end mb-lg-0">
                  {t("documentType")}
                </label>
              </div>
              <div className="form-group-inline" style={{ flex: 1 }}>
                <div className={"w-100"}>
                  <p className="info-value mb-0">{formData.documentType}</p>
                </div>
              </div>
            </div>
            <div className="form-inline-container mt-2">
              <div className="form-group-inline">
                <label className="form-label mb-0">{t("documentNo")}</label>
              </div>
              <div className="form-group-inline" style={{ flex: 1 }}>
                <div className={"w-100"}>
                  <p className="info-value mb-0">{formData.documentNo}</p>
                </div>
              </div>
              <div className="d-none d-lg-flex" style={{ flex: 0.05 }} />
              <div className="form-group-inline">
                <label className="form-label text-lg-end mb-lg-0">
                  {t("yearBE")}
                </label>
              </div>
              <div className="form-group-inline" style={{ flex: 1 }}>
                <div className="w-100">
                  <p className="info-value mb-0">{formData.year}</p>
                </div>
              </div>
            </div>
            <div className="form-inline-container mt-2">
              <div className="form-group-inline">
                <label className="form-label mb-0">{t("registrationNo")}</label>
              </div>
              <div className="form-group-inline" style={{ flex: 1 }}>
                <div className="w-100">
                  <p className="info-value mb-0">{formData.registrationNo}</p>
                </div>
              </div>
              <div className="d-none d-lg-flex" style={{ flex: 0.05 }} />
              <div className="form-group-inline">
                <label className="form-label text-lg-end mb-lg-0">
                  {t("status")}
                </label>
              </div>
              <div className="form-group-inline" style={{ flex: 1 }}>
                <div className="w-100">
                  <p className="info-value mb-0">{formData.status}</p>
                </div>
              </div>
            </div>
            <div className="form-inline-container mt-2">
              <div className="form-group-inline">
                <label className="form-label mb-0">{t("sender")}</label>
              </div>
              <div className="form-group-inline" style={{ flex: 1 }}>
                <div className="w-100">
                  <p className="info-value mb-0">
                    {departmentCodeToTitle(departmentList, formData.sender)}
                  </p>
                </div>
              </div>
              <div className="d-none d-lg-flex" style={{ flex: 0.05 }} />
              <div className="form-group-inline">
                <label className="form-label text-lg-end mb-lg-0">
                  {t("receiver")}
                </label>
              </div>
              <div className="form-group-inline" style={{ flex: 1 }}>
                <div className="w-100">
                  <p className="info-value mb-0">
                    {departmentCodeToTitle(departmentList, formData.receiver)}
                  </p>
                </div>
              </div>
            </div>
            <div className="form-inline-container mt-5">
              <div className="form-group-inline">
                <label className="form-label mb-0">{t("title")}</label>
              </div>
              <div className="form-group-inline" style={{ flex: 0.5 }}>
                <div className="w-100">
                  <p className="info-value mb-0">{formData.title}</p>
                </div>
              </div>
            </div>
            <div className="form-inline-container mt-3">
              <div
                className="form-group-inline"
                style={{ alignItems: "flex-start" }}
              >
                <label className="form-label mb-0">{t("detail")}</label>
              </div>
              <div style={{ flex: 1 }}>
                <p className="info-value mb-0">{formData.detail}</p>
              </div>
            </div>
          </div>
          <div className="d-flex d-lg-none form-info-container">
            <div className="form-inline-container">
              <div className="form-group-inline">
                <label className="form-label mb-0">{t("receivedDate")}</label>
              </div>
              <div className="form-group-inline" style={{ flex: 1 }}>
                <div className={"w-100"}>
                  <p className="info-value mb-0">
                    {moment(formData.receivedDate).format("DD-MM-YYYY")}
                  </p>
                </div>
              </div>
            </div>
            <div className="form-inline-container">
              <div className="form-group-inline">
                <label className="form-label mb-0">{t("documentType")}</label>
              </div>
              <div className="form-group-inline" style={{ flex: 1 }}>
                <div className={"w-100"}>
                  <p className="info-value mb-0">{formData.documentType}</p>
                </div>
              </div>
            </div>
            <div className="form-inline-container mt-2">
              <div className="form-group-inline">
                <label className="form-label mb-0">{t("documentNo")}</label>
              </div>
              <div className="form-group-inline" style={{ flex: 1 }}>
                <div className={"w-100"}>
                  <p className="info-value mb-0">{formData.documentNo}</p>
                </div>
              </div>
            </div>
            <div className="form-inline-container mt-2">
              <div className="form-group-inline">
                <label className="form-label mb-0">{t("yearBE")}</label>
              </div>
              <div className="form-group-inline" style={{ flex: 1 }}>
                <div className="w-100">
                  <p className="info-value mb-0">{formData.year}</p>
                </div>
              </div>
            </div>
            <div className="form-inline-container mt-2">
              <div className="form-group-inline">
                <label className="form-label mb-0">{t("registrationNo")}</label>
              </div>
              <div className="form-group-inline" style={{ flex: 1 }}>
                <div className="w-100">
                  <p className="info-value mb-0">{formData.registrationNo}</p>
                </div>
              </div>
            </div>
            <div className="form-inline-container mt-2">
              <div className="form-group-inline">
                <label className="form-label mb-0">{t("status")}</label>
              </div>
              <div className="form-group-inline" style={{ flex: 1 }}>
                <div className="w-100">
                  <p className="info-value mb-0">{formData.status}</p>
                </div>
              </div>
            </div>
            <div className="form-inline-container mt-2">
              <div className="form-group-inline">
                <label className="form-label mb-0">{t("sender")}</label>
              </div>
              <div className="form-group-inline" style={{ flex: 1 }}>
                <div className="w-100">
                  <p className="info-value mb-0">
                    {departmentCodeToTitle(departmentList, formData.sender)}
                  </p>
                </div>
              </div>
            </div>
            <div className="form-inline-container mt-2">
              <div className="form-group-inline">
                <label className="form-label mb-0">{t("receiver")}</label>
              </div>
              <div className="form-group-inline" style={{ flex: 1 }}>
                <div className="w-100">
                  <p className="info-value mb-0">
                    {departmentCodeToTitle(departmentList, formData.receiver)}
                  </p>
                </div>
              </div>
            </div>
            <div
              className="form-inline-container mt-4"
              style={{ width: "100%" }}
            >
              <div className="form-group-inline">
                <label className="form-label mb-0">{t("title")}</label>
              </div>
              <div className="form-group-inline">
                <div className="w-100">
                  <p className="info-value mb-0">{formData.title}</p>
                </div>
              </div>
            </div>
            <div
              className="form-inline-container mt-2"
              style={{ width: "100%" }}
            >
              <div
                className="form-group-inline"
                style={{ alignItems: "flex-start" }}
              >
                <label className="form-label mb-0">{t("detail")}</label>
              </div>
              <div style={{ flex: 1 }}>
                <p className="info-value mb-0">{formData.detail}</p>
              </div>
            </div>
          </div>
          <div className="pt-2">
            <p className="info-title mt-4 mb-0">{t("fileList")}</p>
            <div className="upload-list" style={{ overflowY: "unset" }}>
              {filesForm.length
                ? filesForm.map((item, index) => (
                    <div
                      className={"file-list-container mt-2 pointer"}
                      key={index}
                    >
                      <div
                        className="file-list"
                        onClick={() => window.open(item.link, "_blank")}
                      >
                        {fileIconHandle(getFileTypeFromName(item.name))}
                        <div className="file-info-container">
                          <div className="upload-title-container">
                            <p className="mb-0">{item.name}</p>
                          </div>
                          <span className="file-size">
                            {item.size ? item.size : "0 Bytes"}
                          </span>
                        </div>
                        <div className="upload-btn-container">
                          <div className="upload-delete-btn me-2 pointer">
                            <Image src={DownloadIcon} alt={t("download")} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                : "-"}
            </div>
          </div>
        </div>
        <div className="modal-footer-container mt-3 px-4">
          <button className="cancel-btn" onClick={() => clearForm("view")}>
            {t("close")}
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
          <h4 className="delete-title mt-4">{t("deleteDocument")}</h4>
          <p className="delete-message mb-0">
            {t("deleteMessage1")}
            {formData.documentNo}
            {t("deleteMessage2")}
          </p>
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
                <p className="error-text mt-0 mt-lg-0 mb-0">
                  {deleteValue.error}
                </p>
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
            onClick={() => confirmDelete()}
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

export default Documents;
