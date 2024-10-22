import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { Image, Modal } from "react-bootstrap";
import {
  fileIconHandle,
  formatBytes,
  getFileTypeFromName,
  validateToken,
} from "../utils/utils";
import UploadIcon from "../assets/images/upload.png";
import EditIcon from "../assets/images/edit.png";
import SaveIcon from "../assets/images/save.png";
import RemoveIcon from "../assets/images/bin_black.png";
import WarningIcon from "../assets/images/delete.png";
import { useNavigate } from "react-router-dom";
import { deleteFileApi } from "../api/api";

const DragDropUpload = ({
  onFilesSelected,
  filesForm,
  setFilesForm,
  id,
  setLoadingModal,
  uploadProcess,
  setUploadProcess,
}) => {
  const navigate = useNavigate();

  const { t } = useTranslation();

  const [files, setFiles] = useState([]);
  const [fileType, setFileType] = useState("");
  const [uploadStatus, setUploadStatus] = useState(false);
  const [editIndex, setEditIndex] = useState(-1);
  const [editFormIndex, setEditFormIndex] = useState(-1);
  const [showEdit, setShowEdit] = useState(false);
  const [showFormEdit, setShowFormEdit] = useState(false);
  const [fileIndex, setFileIndex] = useState(-1);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
  const [confirmDeleteArrModal, setConfirmDeleteArrModal] = useState(false);
  const [name, setName] = useState("");
  const [errorModal, setErrorModal] = useState(false);

  const intervalRef = useRef(0);
  const uploadFileRef = useRef();

  useEffect(() => {
    onFilesSelected(files);
  }, [files, onFilesSelected]);

  const handleFileChange = (event) => {
    const selectedFiles = event.target.files;

    const newFiles = [];

    if (selectedFiles && selectedFiles.length > 0) {
      const maxAllowedSize = 15 * 1024 * 1024;

      if (selectedFiles[0].size > maxAllowedSize) {
        setErrorModal(true);

        return;
      }

      const fileObj = {
        title: "",
        fileName: selectedFiles[0].name,
        file: Array.from(selectedFiles),
      };

      // const newFiles = Array.from(fileObj);

      newFiles.push(fileObj);

      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
      setFileType(selectedFiles[0].type);
    }

    let count = 0;

    setUploadProcess(0);
    clearInterval(intervalRef.current);
    setUploadStatus(false);
    setShowEdit(true);
    setEditIndex(files.length);

    const interval = setInterval(() => {
      setUploadProcess(count++);

      if (count > 100) {
        clearInterval(interval);
        setUploadStatus(true);
      }
    }, 25);

    intervalRef.current = interval;
  };

  const handleDrop = (event) => {
    event.preventDefault();

    const droppedFiles = event.dataTransfer.files;

    const newFiles = [];

    if (droppedFiles.length > 0) {
      const maxAllowedSize = 15 * 1024 * 1024;

      if (droppedFiles[0].size > maxAllowedSize) {
        setErrorModal(true);

        return;
      }

      const fileObj = {
        title: "",
        fileName: droppedFiles[0].name,
        file: Array.from(droppedFiles),
      };
      // const newFiles = Array.from(droppedFiles);

      newFiles.push(fileObj);

      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
      setFileType(droppedFiles[0].type);
    }

    let count = 0;

    setUploadProcess(0);
    clearInterval(intervalRef.current);
    setUploadStatus(false);
    setShowEdit(true);
    setEditIndex(files.length);

    const interval = setInterval(() => {
      setUploadProcess(count++);

      if (count > 100) {
        clearInterval(interval);
        setUploadStatus(true);
      }
    }, 50);

    intervalRef.current = interval;
  };

  const handleRemoveFileUpload = () => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== fileIndex));
    setConfirmDeleteModal(false);
  };

  const handleRemoveFileUploadArr = () => {
    handleRemoveFileArr(fileIndex, name);
  };

  const handleRemoveFileArr = async (index, fileName) => {
    try {
      const token = validateToken();

      if (!token) {
        navigate("/login");
      }

      setLoadingModal(true);

      await deleteFileApi(token, id, fileName);

      setFilesForm((prevFiles) => prevFiles.filter((_, i) => i !== index));
      setConfirmDeleteArrModal(false);
    } catch (e) {
      console.log(e);
    } finally {
      setLoadingModal(false);
    }
  };

  const editFileHandle = (index, key, value) => {
    const fileArr = files.map((i, j) => {
      const type = getFileTypeFromName(i.fileName);

      if (key === "title" && index === j) {
        i.title = value ? value + "." + type : i.fileName;
      } else if (key === "fileName" && index === j) {
        i.fileName = value ? value + "." + type : i.fileName;
      }

      return i;
    });

    setFiles(fileArr);
  };

  const saveEditHandle = (index) => {
    let fileName = files[index].fileName;

    if (
      files[index].fileName !== files[index].file[0].name ||
      files[index].title.length
    ) {
      if (files[index].title.length) {
        fileName = files[index].title;
      }

      const newFile = new File([files[index].file[0]], fileName, {
        type: files[index].file[0].type,
      });

      const fileArr = files.map((i, j) => {
        if (index === j) {
          i.fileName = fileName;
          i.file[0] = newFile;
        }
        return i;
      });

      setFiles(fileArr);
    }

    setShowEdit(false);
    setEditIndex(-1);
  };

  const editFileFormHandle = (index, key, value) => {
    const fileArr = filesForm.map((i, j) => {
      if (key === "title" && index === j) {
        i.title = value;
      } else if (key === "fileName" && index === j) {
        i.fileName = value;
      }

      return i;
    });

    setFilesForm(fileArr);
  };

  const updateFileName = (index) => {
    const fileArr = filesForm.map((item, key) => {
      if (index === key) {
        const type = getFileTypeFromName(item.name);

        const name = item.title ? item.title : item.name;

        if (name.substring(0, name.indexOf(".")).length) {
          item.name = name.substring(0, name.indexOf(".")) + "." + type;
        } else {
          item.name = name + "." + type;
        }
      }
      return item;
    });

    setFilesForm(fileArr);
    setShowFormEdit(false);
    setEditFormIndex(-1);
  };

  const validateKey = (e) => {
    if (["."].includes(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <>
      <section className="drag-drop-container">
        <div
          className="upload-box"
          onDrop={handleDrop}
          onDragOver={(event) => event.preventDefault()}
          onClick={() => uploadFileRef.current.click()}
        >
          <label className="upload-info prevent-select">
            <p className="mb-1">
              <Image
                src={UploadIcon}
                alt={t("upload")}
                className="upload-icon"
              />
              {t("dragDropText1")}
              <span>{t("dragDropText2")}</span>
              {t("dragDropText3")}
            </p>
          </label>
          <input
            ref={uploadFileRef}
            type="file"
            hidden
            accept=".pdf,.docx,.pptx,.txt,.xlsx,.csv,image/*"
            id="browse"
            multiple
            onChange={handleFileChange}
          />
        </div>
        <p className="mb-0 mt-1 upload-note">{t("uploadNote")}</p>
        <div className="upload-list mt-3">
          {filesForm.length > 0 &&
            filesForm.map((item, index) => (
              <div className={"file-list-container mt-2"} key={index}>
                <div className="file-list">
                  {fileIconHandle(getFileTypeFromName(item.name))}
                  <div className="file-info-container">
                    {editFormIndex === index && showFormEdit ? (
                      <div className="edit-file-input-container mb-1">
                        <input
                          className="edit-file-input"
                          placeholder={t("title")}
                          defaultValue={item.name.substring(
                            0,
                            item.name.indexOf(".")
                          )}
                          onKeyDown={(e) => validateKey(e)}
                          onChange={(e) =>
                            editFileFormHandle(index, "title", e.target.value)
                          }
                        />
                        <button
                          type="button"
                          className="upload-save-btn"
                          onClick={() => updateFileName(index)}
                        >
                          <Image src={SaveIcon} alt={t("save")} />
                        </button>
                      </div>
                    ) : (
                      <div
                        className="upload-title-container"
                        onClick={() => {
                          setEditFormIndex(index);
                          setShowFormEdit(true);
                        }}
                      >
                        <p className="file-name mb-0 pointer">{item.name}</p>
                        <Image
                          src={EditIcon}
                          alt={t("edit")}
                          className="edit-file-icon ms-1"
                        />
                      </div>
                    )}
                    <span className="file-size">{item.size}</span>
                  </div>
                  <div className="upload-btn-container">
                    <div
                      className="upload-delete-btn me-2 pointer"
                      onClick={() => {
                        setFileIndex(index);
                        setName(item.name);
                        setConfirmDeleteArrModal(true);
                      }}
                    >
                      <Image src={RemoveIcon} alt={t("delete")} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          {files.length > 0 &&
            files.map((file, index) =>
              index + 1 !== files.length ? (
                <div className={"file-list-container mt-2"} key={index}>
                  <div className="file-list">
                    {fileIconHandle(file.file[0].type)}
                    <div className="file-info-container">
                      {editIndex === index && showEdit ? (
                        <div className="edit-file-input-container mb-1">
                          <input
                            className="edit-file-input"
                            placeholder={t("title")}
                            defaultValue={file.title.substring(
                              0,
                              file.title.indexOf(".")
                            )}
                            onKeyDown={(e) => validateKey(e)}
                            onChange={(e) =>
                              editFileHandle(index, "title", e.target.value)
                            }
                          />
                          {/* <input
                            className="edit-file-input"
                            placeholder={t("fileName")}
                            defaultValue={file.file[0].name}
                            onChange={(e) =>
                              editFileHandle(index, "fileName", e.target.value)
                            }
                            disabled
                          /> */}
                          <button
                            type="button"
                            className="upload-save-btn"
                            onClick={() => saveEditHandle(index)}
                          >
                            <Image src={SaveIcon} alt={t("save")} />
                          </button>
                        </div>
                      ) : (
                        <div
                          className="upload-title-container"
                          onClick={() => {
                            setEditIndex(index);
                            setShowEdit(true);
                          }}
                        >
                          <p className="file-name mb-0 pointer">
                            {file.title ? file.title : file.file[0].name}
                          </p>
                          <Image
                            src={EditIcon}
                            alt={t("edit")}
                            className="edit-file-icon ms-1"
                          />
                        </div>
                      )}
                      <span className="file-size">
                        {formatBytes(file.file[0].size)}
                      </span>
                    </div>
                    <div className="upload-btn-container">
                      {editIndex === index && showEdit ? null : (
                        <div
                          className="upload-delete-btn me-2 pointer"
                          onClick={() => {
                            setFileIndex(index);
                            setConfirmDeleteModal(true);
                          }}
                        >
                          <Image src={RemoveIcon} alt={t("delete")} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : uploadStatus ? (
                <div className={"file-list-container mt-2"} key={index}>
                  <div className="file-list">
                    {fileIconHandle(file.file[0].type)}
                    <div className="file-info-container">
                      {editIndex === index && showEdit ? (
                        <div className="edit-file-input-container mb-1">
                          <input
                            className="edit-file-input"
                            placeholder={t("title")}
                            defaultValue={file.title.substring(
                              0,
                              file.title.indexOf(".")
                            )}
                            onKeyDown={(e) => validateKey(e)}
                            onChange={(e) =>
                              editFileHandle(index, "title", e.target.value)
                            }
                          />
                          {/* <input
                            className="edit-file-input"
                            placeholder={t("fileName")}
                            defaultValue={file.file[0].name}
                            onChange={(e) =>
                              editFileHandle(index, "fileName", e.target.value)
                            }
                            disabled
                          /> */}
                          <button
                            type="button"
                            className="upload-save-btn"
                            onClick={() => saveEditHandle(index)}
                          >
                            <Image src={SaveIcon} alt={t("save")} />
                          </button>
                        </div>
                      ) : (
                        <div
                          className="upload-title-container"
                          onClick={() => {
                            setEditIndex(index);
                            setShowEdit(true);
                          }}
                        >
                          <p className="mb-0">
                            {file.title ? file.title : file.file[0].name}
                          </p>
                          <Image
                            src={EditIcon}
                            alt={t("edit")}
                            className="edit-file-icon ms-1"
                          />
                        </div>
                      )}
                      <span className="file-size">
                        {formatBytes(file.file[0].size)}
                      </span>
                    </div>
                    <div className="upload-btn-container">
                      {editIndex === index && showEdit ? null : (
                        <div
                          className="upload-delete-btn me-2 pointer"
                          onClick={() => {
                            setFileIndex(index);
                            setConfirmDeleteModal(true);
                          }}
                        >
                          <Image src={RemoveIcon} alt={t("delete")} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : null
            )}
          {uploadProcess > 0 && uploadProcess < 100 && (
            <div className="file-list-container mt-2">
              <div className="file-list">
                {fileIconHandle(fileType)}
                <div className="file-info-container">
                  <p className="mb-2">
                    {`${t("uploadingFile")} ${"..."} ${uploadProcess}${"%"}`}
                  </p>
                  <div className="progress-bar-file">
                    <div
                      className="progress-bar-value"
                      style={{ width: uploadProcess + "%" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      <Modal
        show={confirmDeleteModal}
        backdrop="static"
        centered
        size="sm"
        className="delete-modal"
      >
        <div className="modal-delete-header p-4">
          <div>
            <Image src={WarningIcon} alt={"delete"} className="delete-icon" />
          </div>
          <h4 className="delete-title mt-4">{t("deleteFileTitle")}</h4>
          <p className="delete-message mb-0">{t("deleteFileText")}</p>
        </div>
        <div className="modal-footer-container delete-footer mt-3">
          <button
            className="cancel-btn"
            onClick={() => setConfirmDeleteModal(false)}
          >
            {t("denyDelete")}
          </button>
          <button
            className="confirm-delete-btn"
            onClick={() => handleRemoveFileUpload()}
          >
            {t("confirmDelete")}
          </button>
        </div>
      </Modal>
      <Modal
        show={confirmDeleteArrModal}
        backdrop="static"
        centered
        size="sm"
        className="delete-modal"
      >
        <div className="modal-delete-header p-4">
          <div>
            <Image src={WarningIcon} alt={"delete"} className="delete-icon" />
          </div>
          <h4 className="delete-title mt-4">{t("deleteFileTitle")}</h4>
          <p className="delete-message mb-0">{t("deleteFileText")}</p>
        </div>
        <div className="modal-footer-container delete-footer mt-3">
          <button
            className="cancel-btn"
            onClick={() => setConfirmDeleteArrModal(false)}
          >
            {t("denyDelete")}
          </button>
          <button
            className="confirm-delete-btn"
            onClick={() => handleRemoveFileUploadArr()}
          >
            {t("confirmDelete")}
          </button>
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
          <h4 className="alert-title mt-4">{t("errorMaxFileSizeTitle")}</h4>
          <p className="alert-message mb-0">{t("errorMaxFileSizeMessage")}</p>
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

DragDropUpload.propTypes = {
  onFilesSelected: PropTypes.func,
  filesForm: PropTypes.array,
  setFilesForm: PropTypes.func,
  id: PropTypes.string,
  setLoadingModal: PropTypes.func,
  uploadProcess: PropTypes.number,
  setUploadProcess: PropTypes.func,
};

export default DragDropUpload;
