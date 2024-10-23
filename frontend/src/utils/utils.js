import React from "react";
import { Image } from "react-bootstrap";
import PdfIcon from "../assets/images/pdf_file.png";
import XlsIcon from "../assets/images/xls_file.png";
import DocIcon from "../assets/images/doc_file.png";
import ImageIcon from "../assets/images/image_file.png";
import { jwtDecode } from "jwt-decode";
import moment from "moment";
import { downloadFileApi } from "../api/api";

const validateToken = () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      return null;
    }

    const decode = jwtDecode(token);

    const now = moment().unix();
    const exp = decode.exp;

    if (exp < now) {
      return null;
    }

    return token;
  } catch {
    return null;
  }
};

const toBuddhistYear = (moment, format) => {
  const christianYear = moment.format("YYYY");
  const buddhistYear = (parseInt(christianYear) + 543).toString();
  return moment
    .format(
      format
        .replace("YYYY", buddhistYear)
        .replace("YY", buddhistYear.substring(2, 4))
    )
    .replace(christianYear, buddhistYear);
};

const numberWithCommas = (val) => {
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const statusComponent = (status) => {
  switch (true) {
    case status.toLowerCase() === "รับทราบ - ดำเนินการ":
      return (
        <div className="status-container">
          <span
            className="status-text"
            style={{
              backgroundColor: "rgba(236, 116, 74, 0.25)",
              color: "#ec744a",
            }}
          >
            {capitalizeFirst(status)}
          </span>
        </div>
      );
    default:
      return (
        <div className="status-container">
          <span
            className="status-text"
            style={{
              backgroundColor: "rgba(10, 159, 44, 0.25)",
              color: "#0a9f2c",
            }}
          >
            {capitalizeFirst(status)}
          </span>
        </div>
      );
  }
};

const capitalizeFirst = (stringVal) => {
  return stringVal.replace(/(^\w{1})|(\s+\w{1})/g, (letter) =>
    letter.toUpperCase()
  );
};

const randomIntFromInterval = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const formatBytes = (bytes, decimals = 2) => {
  if (!+bytes) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const fileIconHandle = (type) => {
  switch (true) {
    case type === "application/pdf" || type === "pdf":
      return <Image src={PdfIcon} alt="pdf" className="file-icon me-2" />;
    case type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      type === "text/csv" ||
      type === "xlsx":
      return <Image src={XlsIcon} alt="xls" className="file-icon me-2" />;
    case type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      type === "docx":
      return <Image src={DocIcon} alt="docx" className="file-icon me-2" />;
    default:
      return <Image src={ImageIcon} alt="pdf" className="file-icon me-2" />;
  }
};

const getFileType = (type) => {
  switch (true) {
    case type === "application/pdf":
      return ".pdf";
    case type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      return ".xlsx";
    case type === "text/csv":
      return ".csv";
    case type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return ".docx";
    case type === "image/jpeg":
      return ".jpg";
    case type === "image/png":
      return ".png";
    default:
      return "";
  }
};

const getFileTypeFromName = (filename) => {
  return (
    filename.substring(filename.lastIndexOf(".") + 1, filename.length) ||
    filename
  );
};

const getFileSizeFromUrl = async (url, id) => {
  try {
    const token = validateToken();

    if (!token) {
      return 0;
    }

    const response = await downloadFileApi(token, id, url);

    const contentLength = response.headers["content-length"];

    const size = contentLength
      ? formatBytes(parseInt(contentLength))
      : formatBytes(0);
    const link = response.data.message;

    return { size, link };
  } catch (error) {
    console.error("Error:", error);

    return 0;
  }
};

const userStatusComponent = (status, t) => {
  // const { t } = useTranslation();

  switch (status) {
    case 1:
      return (
        <div className="status-container">
          <span
            className="status-text"
            style={{
              backgroundColor: "rgba(10, 159, 44, 0.25)",
              color: "#0a9f2c",
            }}
          >
            {t("enable")}
          </span>
        </div>
      );
    default:
      return (
        <div className="status-container">
          <span
            className="status-text"
            style={{
              backgroundColor: "rgba(236, 62, 79, 0.25)",
              color: "#ec3e4f",
            }}
          >
            {t("disable")}
          </span>
        </div>
      );
  }
};

const departmentCodeToTitle = (departmentArr, code) => {
  const result = departmentArr.filter((item) => {
    return item.value.toLowerCase() === code.toLowerCase();
  });

  return result[0] ? capitalizeFirst(result[0].label) : capitalizeFirst(code);
};

const departmentTitleToCode = (departmentArr, label) => {
  if (!label.length) {
    return "";
  }

  const result = departmentArr.filter((item) => {
    return item.label.toLowerCase().indexOf(label.toLowerCase()) >= 0;
  });

  return result[0] ? result[0].value.toLowerCase() : label.toLowerCase();
};

const fileTypeKind = (value, t) => {
  switch (true) {
    case value === "xlsx" || value === "csv":
      return "XLSX";
    case value === "docx":
      return "DOCX";
    case value === "pdf":
      return "PDF";
    default:
      return t("image");
  }
};

const getEndpoint = () => {
  if (process.env.REACT_APP_API_ENDPOINT) {
    return process.env.REACT_APP_API_ENDPOINT;
  } else {
    return "localhost";
  }
};

const randomName = (length) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
};

const randomFileType = () => {
  const value = randomIntFromInterval(1, 5);

  switch (value) {
    case 1:
      return ".pdf";
    case 2:
      return ".xlsx";
    case 3:
      return ".docx";
    case 4:
      return ".jpg";
    default:
      return ".png";
  }
};

export {
  validateToken,
  toBuddhistYear,
  numberWithCommas,
  statusComponent,
  capitalizeFirst,
  randomIntFromInterval,
  fileIconHandle,
  formatBytes,
  getFileType,
  getFileTypeFromName,
  getFileSizeFromUrl,
  userStatusComponent,
  departmentCodeToTitle,
  departmentTitleToCode,
  fileTypeKind,
  getEndpoint,
  randomName,
  randomFileType,
};
