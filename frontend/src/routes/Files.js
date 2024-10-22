import React, { useState, useEffect, useRef } from "react";
import Nav from "../components/Nav";
import { useTranslation } from "react-i18next";
import Skeleton from "react-loading-skeleton";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import {
  formatBytes,
  getFileTypeFromName,
  numberWithCommas,
  randomIntFromInterval,
  validateToken,
  fileTypeKind,
} from "../utils/utils";
import PdfIcon from "../assets/images/pdf_file.png";
import XlsIcon from "../assets/images/xls_file.png";
import DocIcon from "../assets/images/doc_file.png";
import ImageIcon from "../assets/images/image_file.png";
import { Image, Table } from "react-bootstrap";
import SortUpIcon from "../assets/images/sort_up.png";
import SortDownIcon from "../assets/images/sort_down.png";
import ClearIcon from "../assets/images/clear.png";
import MoreIcon from "../assets/images/more.png";
import EditIcon from "../assets/images/edit.png";
import DeleteIcon from "../assets/images/bin.png";
import moment from "moment";

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

const Files = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [loadingModal, setLoadingModal] = useState(false);
  const [fileTypeTotal, setFileTypeTotal] = useState({
    pdf: 0,
    docx: 0,
    xlsx: 0,
    image: 10,
  });
  const [fileList, setFileList] = useState([]);
  const [fileListFilter, setFileListFilter] = useState([]);
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
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    url: "",
    errorName: "",
  });
  const [successModal, setSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [successTitle, setSuccessTitle] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorTitle, setErrorTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [deleteValue, setDeleteValue] = useState({
    value: "",
    error: "",
  });

  const filter = useRef({
    type: "",
  });
  const typeRef = useRef(null);
  const sortByRef = useRef({
    key: "name",
    value: "asc",
  });

  const from = (page - 1) * limit;
  const to = Math.min(page * limit, fileListFilter.length);

  useEffect(() => {
    console.log(process.env.REACT_APP_API_ENDPOINT);

    (async () => {
      try {
        const token = validateToken();

        if (!token) {
          navigate("/login");
        }

        const DummyData = Array(10).fill({
          name: "test_image.png",
          url: "",
          type: fileTypeKind(getFileTypeFromName("test_image.png"), t),
          size: formatBytes(randomIntFromInterval(10, Math.pow(10, 6))),
          updatedDate: new Date(),
        });
        const total = DummyData.length;

        const fileListArr = DummyData.sort((a, b) => {
          if (a.name < b.name) {
            return -1;
          } else if (a.name > b.name) {
            return 1;
          }

          return 0;
        });

        if (total / limit > 1) {
          setEnableNext(true);
        }

        setFileList(fileListArr);
        setFileListFilter(fileListArr);
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

    const fileListArr = fileListFilter.sort((a, b) => {
      switch (true) {
        case key === "type":
          if (sortByRef.current.value === "asc") {
            if (a.type > b.type) {
              return 1;
            } else if (a.type < b.type) {
              return -1;
            }

            return 0;
          } else {
            if (a.type > b.type) {
              return -1;
            } else if (a.type < b.type) {
              return 1;
            }

            return 0;
          }
        case key === "size":
          if (sortByRef.current.value === "asc") {
            if (a.size > b.size) {
              return 1;
            } else if (a.size < b.size) {
              return -1;
            }

            return 0;
          } else {
            if (a.size > b.size) {
              return -1;
            } else if (a.size < b.size) {
              return 1;
            }

            return 0;
          }
        case key === "updateDate":
          if (sortByRef.current.value === "asc") {
            if (
              moment(a.updatedDate).valueOf() > moment(b.updatedDate).valueOf()
            ) {
              return 1;
            } else if (
              moment(a.updatedDate).valueOf() < moment(b.updatedDate).valueOf()
            ) {
              return -1;
            }

            return 0;
          } else {
            if (
              moment(a.updatedDate).valueOf() > moment(b.updatedDate).valueOf()
            ) {
              return -1;
            } else if (
              moment(a.updatedDate).valueOf() < moment(b.updatedDate).valueOf()
            ) {
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
    setFileListFilter(fileListArr);
  };

  const goFirst = () => {
    setPage(1);
    setPageInput(1);
    setEnablePre(false);
    setEnableNext(true);
  };

  const goLast = () => {
    setPage(Math.ceil(fileListFilter.length / limit));
    setPageInput(Math.ceil(fileListFilter.length / limit));
    setEnableNext(false);
    setEnablePre(true);
  };

  const next = () => {
    setEnablePre(true);
    setPage((prevValue) => prevValue + 1);
    setPageInput((prevValue) => prevValue + 1);

    const lastPage = Math.min((page + 1) * limit, fileListFilter.length);

    if (lastPage !== fileListFilter.length) {
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
      } else if (Math.ceil(fileListFilter.length / limit) > parseInt(value)) {
        setPage(value);
        setPageInput(value);
        setEnableNext(true);
        setEnablePre(true);
      } else {
        setPage(Math.ceil(fileListFilter.length / limit));
        setPageInput(Math.ceil(fileListFilter.length / limit));
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
      const result = fileList.filter((item) => {
        return (
          item.name.toLowerCase().indexOf(val.toLowerCase()) >= 0 &&
          (filter.current.type
            ? item.type.toLowerCase() === filter.current.type.toLowerCase()
            : true)
        );
      });

      setPage(1);
      setEnablePre(false);

      setFileListFilter(result);

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
      const result = fileList.filter((item) => {
        return (
          item.name.toLowerCase().indexOf(keyword.toLowerCase()) >= 0 &&
          (filter.current.type
            ? item.type.toLowerCase() === filter.current.type.toLowerCase()
            : true)
        );
      });

      setPage(1);
      setEnablePre(false);

      setFileListFilter(result);

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
      type: "",
    };

    typeRef.current.clearValue();

    setKeyword("");
    setPage(1);
    setEnablePre(false);

    filterHandle();
  };

  const clearForm = (type) => {
    if (type === "edit") {
      setEditModal(false);
    } else {
      setDeleteModal(false);
    }

    setFormData({
      id: "",
      name: "",
      url: "",
      errorName: "",
    });
    setDeleteValue({ value: "", error: "" });
  };

  const validateForm = (type) => {
    if (!formData.name) {
      setFormData({
        ...formData,
        errorName: formData.name ? "" : t("errorEmptyFileName"),
      });

      return;
    }

    if (type === "add") {
      //
    } else {
      //
    }
  };

  const updateFileHandle = async () => {
    try {
      setLoadingModal(false);
      clearForm("edit");

      setSuccessModal(true);
      setSuccessTitle(t("updateFileSuccessTitle"));
      setSuccessMessage(t("updateFileSuccessMessage"));
    } catch (e) {
      console.log(e);

      setLoadingModal(false);
      clearForm("edit");

      setErrorModal(true);
      setErrorTitle(t("updateFileErrorTitle"));
      setErrorMessage(t("updateFileErrorMessage"));
    }
  };

  const deleteFileHandle = async () => {
    try {
      setLoadingModal(false);
      clearForm("delete");

      setSuccessModal(true);
      setSuccessTitle(t("deleteFileSuccessTitle"));
      setSuccessMessage(t("deleteFileSuccessMessage"));
    } catch (e) {
      console.log(e);

      setLoadingModal(false);
      clearForm("delete");

      setErrorModal(true);
      setErrorTitle(t("deleteFileErrorTitle"));
      setErrorMessage(t("deleteFileErrorMessage"));
    }
  };

  const fetchFileList = async () => {};

  return (
    <div className="main">
      <Nav page={"file"} />
      <h3 className="title mt-4">
        {t("files")}
        {" : "}
        <span className="title-date">
          {numberWithCommas(
            fileTypeTotal.pdf +
              fileTypeTotal.docx +
              fileTypeTotal.xlsx +
              fileTypeTotal.image
          )}
        </span>
      </h3>
      <div className="summary-card-container mt-3">
        <div className="summary-card">
          <div style={{ flex: 1 }}>
            <span className="summary-card-title">PDF</span>
            <p className="summary-card-value mb-0">
              {numberWithCommas(fileTypeTotal.pdf)}
            </p>
          </div>
          <div
            className="summary-icon-container"
            style={{ background: "rgba(236, 62, 79, 0.15)" }}
          >
            <Image src={PdfIcon} className="summary-icon" alt={"pdf"} />
          </div>
        </div>
        <div className="summary-card">
          <div style={{ flex: 1 }}>
            <span className="summary-card-title">DOCX</span>
            <p className="summary-card-value mb-0">
              {numberWithCommas(fileTypeTotal.docx)}
            </p>
          </div>
          <div
            className="summary-icon-container"
            style={{ background: "rgba(63, 190, 238, 0.15)" }}
          >
            <Image src={DocIcon} className="summary-icon" alt={"docx"} />
          </div>
        </div>
        <div className="summary-card">
          <div style={{ flex: 1 }}>
            <span className="summary-card-title">XLSX</span>
            <p className="summary-card-value mb-0">
              {numberWithCommas(fileTypeTotal.xlsx)}
            </p>
          </div>
          <div
            className="summary-icon-container"
            style={{ background: "rgba(10, 159, 44, 0.15)" }}
          >
            <Image src={XlsIcon} className="summary-icon" alt={"xlsx"} />
          </div>
        </div>
        <div className="summary-card">
          <div style={{ flex: 1 }}>
            <span className="summary-card-title">{t("image")}</span>
            <p className="summary-card-value mb-0">
              {numberWithCommas(fileTypeTotal.image)}
            </p>
          </div>
          <div
            className="summary-icon-container"
            style={{ background: "rgba(236, 116, 74, 0.15)" }}
          >
            <Image src={ImageIcon} className="summary-icon" alt={t("image")} />
          </div>
        </div>
        <div className="d-none d-lg-block" style={{ flex: 1 }}></div>
      </div>
      <div className="card-container">
        <h5 className="card-title mb-0">{t("fileList")}</h5>
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
            <label className="filter-label">{t("type")}</label>
            <Select
              ref={typeRef}
              options={[
                {
                  label: "PDF",
                  value: "PDF",
                },
                {
                  label: "DOCX",
                  value: "DOCX",
                },
                {
                  label: "XLSX",
                  value: "XLSX",
                },
                {
                  label: t("image"),
                  value: t("image"),
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
          <div className="clear-btn pointer" onClick={() => clearFilter()}>
            <Image src={ClearIcon} alt={"clear"} className="clear-btn-icon" />
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
                    <span>{t("fileName")}</span>
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
                  onClick={() => sortHandle("type")}
                >
                  <div>
                    <span>{t("type")}</span>
                    <div className="sort-container">
                      <Image
                        src={SortUpIcon}
                        alt={t("sortUp")}
                        className={
                          sortBy.key === "type" && sortBy.value === "asc"
                            ? "sort-icon active"
                            : "sort-icon"
                        }
                      />
                      <Image
                        src={SortDownIcon}
                        alt={t("sortDown")}
                        className={
                          sortBy.key === "type" && sortBy.value === "desc"
                            ? "sort-icon active"
                            : "sort-icon"
                        }
                      />
                    </div>
                  </div>
                </th>
                <th
                  className="table-header pointer prevent-select"
                  onClick={() => sortHandle("size")}
                >
                  <div>
                    <span>{t("size")}</span>
                    <div className="sort-container">
                      <Image
                        src={SortUpIcon}
                        alt={t("sortUp")}
                        className={
                          sortBy.key === "size" && sortBy.value === "asc"
                            ? "sort-icon active"
                            : "sort-icon"
                        }
                      />
                      <Image
                        src={SortDownIcon}
                        alt={t("sortDown")}
                        className={
                          sortBy.key === "size" && sortBy.value === "desc"
                            ? "sort-icon active"
                            : "sort-icon"
                        }
                      />
                    </div>
                  </div>
                </th>
                <th
                  className="table-header pointer prevent-select"
                  onClick={() => sortHandle("updateDate")}
                >
                  <div>
                    <span>{t("modifiedDate")}</span>
                    <div className="sort-container">
                      <Image
                        src={SortUpIcon}
                        alt={t("sortUp")}
                        className={
                          sortBy.key === "updateDate" && sortBy.value === "asc"
                            ? "sort-icon active"
                            : "sort-icon"
                        }
                      />
                      <Image
                        src={SortDownIcon}
                        alt={t("sortDown")}
                        className={
                          sortBy.key === "updateDate" && sortBy.value === "desc"
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
              {fileListFilter.length ? (
                fileListFilter.slice(from, to).map((item, index) => (
                  <tr key={index}>
                    <td className="table-body">
                      {loading ? <Skeleton /> : item?.name ? item.name : "-"}
                    </td>
                    <td className="table-body">
                      {loading ? <Skeleton /> : item?.type ? item.type : "-"}
                    </td>
                    <td className="table-body">
                      {loading ? <Skeleton /> : item?.size ? item.size : "-"}
                    </td>
                    <td className="table-body">
                      {loading ? (
                        <Skeleton />
                      ) : item?.updatedDate ? (
                        moment(item.updatedDate).format("DD/MM/YYYY")
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
                            index + 1 === fileListFilter.length &&
                            index &&
                            fileListFilter.length > 5
                              ? "more-menu-container down"
                              : "more-menu-container up"
                          }
                          onMouseLeave={() => setShowIndex(-1)}
                        >
                          <div
                            className="more-menu"
                            onClick={() => {
                              setFormData({
                                id: "",
                                name: item.name,
                                url: item.url,
                                errorName: "",
                              });
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
                  <td colSpan={5} className="table-body text-center">
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
            <span className="paginate-text">{`${fileListFilter.length ? from + 1 : 0}-${to} ${t("of")} ${
              fileListFilter.length
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
            <span className="paginate-text">{`${t("from")} ${Math.ceil(fileListFilter.length / limit)}`}</span>
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
    </div>
  );
};

export default Files;
