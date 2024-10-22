import axios from "axios";
import moment from "moment";

const loginApi = async (username, password) => {
  return await axios({
    url: process.env.REACT_APP_API_ENDPOINT + "/api/v1/users/signin",
    method: "POST",
    timeout: 5000,
    data: JSON.stringify({
      username: username,
      password: password,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

const documentListApi = async (token, limit, page) => {
  return await axios({
    url:
      limit && page
        ? process.env.REACT_APP_API_ENDPOINT +
          "/api/v1/documents?limit=" +
          limit +
          "&page=" +
          page
        : process.env.REACT_APP_API_ENDPOINT + "/api/v1/documents",
    method: "GET",
    timeout: 5000,
    headers: {
      Authorization: "Bearer " + token,
    },
  });
};

const addDocumentApi = async (token, data) => {
  return await axios({
    url: process.env.REACT_APP_API_ENDPOINT + "/api/v1/documents",
    method: "POST",
    withCredentials: true,
    timeout: 5000,
    data: JSON.stringify({
      year: moment(data.year).format("YYYY"), // ปีเอกสาร
      regReceipt: data.registrationNo, // ทะเบียนรับ
      subjectCode: data.documentNo, //  เลขที่เอกสาร
      subjectType: data.documentType, // ประเภทเอกสาร
      status: data.status, // สถานะรายการ รับ-ส่ง เอกสาร
      subjectTitle: data.title, // เรื่อง
      subjectDetail: data.detail, // รายละเอียด
      sender: data.sender, // ผู้ส่ง
      receiver: data.receiver, // ส่งถึงผู้รับ
      receivedDate: moment(data.receivedDate).format("YYYY-MM-DD"),
      files: [],
    }),
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
  });
};

const updateDocumentApi = async (token, data, fileArr) => {
  return await axios({
    url: process.env.REACT_APP_API_ENDPOINT + "/api/v1/documents",
    method: "PUT",
    timeout: 5000,
    data: JSON.stringify({
      id: data.id,
      year: moment(data.year).format("YYYY"), // ปีเอกสาร
      regReceipt: data.registrationNo, // ทะเบียนรับ
      subjectCode: data.documentNo, //  เลขที่เอกสาร
      subjectType: data.documentType, // ประเภทเอกสาร
      status: data.status, // สถานะรายการ รับ-ส่ง เอกสาร
      subjectTitle: data.title, // เรื่อง
      subjectDetail: data.detail, // รายละเอียด
      sender: data.sender, // ผู้ส่ง
      receiver: data.receiver, // ส่งถึงผู้รับ
      receivedDate: moment(data.receivedDate).format("YYYY-MM-DD"),
      files: fileArr,
    }),
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
  });
};

const deleteDocumentApi = async (token, id) => {
  return await axios({
    url: process.env.REACT_APP_API_ENDPOINT + "/api/v1/documents/" + id,
    method: "DELETE",
    timeout: 5000,
    headers: {
      Authorization: "Bearer " + token,
    },
  });
};

const uploadFileApi = async (token, id, data) => {
  let formData = new FormData();

  data.map((item) => {
    formData.append("uploads[]", item.file[0]);

    return item;
  });

  for (const value of formData.values()) {
    console.log(value);
  }

  return await axios({
    url: process.env.REACT_APP_API_ENDPOINT + "/api/v1/documents/files/" + id,
    method: "POST",
    withCredentials: true,
    timeout: 5000,
    data: formData,
    headers: {
      Authorization: "Bearer " + token,
    },
  });
};

const deleteFileApi = async (token, id, fileName) => {
  return await axios({
    url:
      process.env.REACT_APP_API_ENDPOINT + "/api/v1/documents/" + id + "/files",
    method: "DELETE",
    timeout: 5000,
    data: JSON.stringify({
      file: fileName,
    }),
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
  });
};

const downloadFileApi = async (token, id, url) => {
  return await axios({
    url:
      process.env.REACT_APP_API_ENDPOINT +
      "/api/v1/documents/" +
      id +
      "/files/download?url=" +
      url,
    method: "GET",
    timeout: 5000,
    headers: {
      Authorization: "Bearer " + token,
    },
  });
};

const userInfoApi = async (token, id) => {
  return await axios({
    url: process.env.REACT_APP_API_ENDPOINT + "/api/v1/users/" + id,
    method: "GET",
    timeout: 5000,
    headers: {
      Authorization: "Bearer " + token,
    },
  });
};

const updateUserInfoApi = async (token, data) => {
  return await axios({
    url: process.env.REACT_APP_API_ENDPOINT + "/api/v1/users",
    method: "PUT",
    timeout: 5000,
    data: JSON.stringify({
      id: data.id,
      name: data.firstName,
      lastname: data.lastName,
      email: data.email,
      department: data.department,
      acl: data.acl,
      status: parseInt(data.status),
    }),
    headers: {
      Authorization: "Bearer " + token,
    },
  });
};

const changePasswordApi = async (token, password) => {
  return await axios({
    url: process.env.REACT_APP_API_ENDPOINT + "/api/v1/users/changepassword",
    method: "POST",
    timeout: 5000,
    data: JSON.stringify({
      password: password,
    }),
    headers: {
      Authorization: "Bearer " + token,
    },
  });
};

const userListApi = async (token) => {
  return await axios({
    url: process.env.REACT_APP_API_ENDPOINT + "/api/v1/users",
    method: "GET",
    timeout: 5000,
    headers: {
      Authorization: "Bearer " + token,
    },
  });
};

const addUserApi = async (token, data) => {
  return await axios({
    url: process.env.REACT_APP_API_ENDPOINT + "/api/v1/users",
    method: "POST",
    timeout: 5000,
    data: JSON.stringify({
      name: data.firstName,
      lastname: data.lastName,
      email: data.email,
      department: data.department,
      username: data.username,
      password: data.password,
      acl: data.acl,
      status: parseInt(data.status),
    }),
    headers: {
      Authorization: "Bearer " + token,
    },
  });
};

const deleteUserApi = async (token, id) => {
  return await axios({
    url: process.env.REACT_APP_API_ENDPOINT + "/api/v1/users/" + id,
    method: "DELETE",
    timeout: 5000,
    headers: {
      Authorization: "Bearer " + token,
    },
  });
};

const departmentListApi = async (token) => {
  return await axios({
    url: process.env.REACT_APP_API_ENDPOINT + "/api/v1/departments",
    method: "GET",
    timeout: 5000,
    headers: {
      Authorization: "Bearer " + token,
    },
  });
};

export {
  loginApi,
  documentListApi,
  addDocumentApi,
  updateDocumentApi,
  deleteDocumentApi,
  uploadFileApi,
  deleteFileApi,
  downloadFileApi,
  userInfoApi,
  updateUserInfoApi,
  changePasswordApi,
  userListApi,
  addUserApi,
  deleteUserApi,
  departmentListApi,
};
