import React from "react";
import Nav from "../components/Nav";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const PageNotFound = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  return (
    <div className="main">
      <Nav />
      <div className="page-not-found-container">
        <div className="page-not-found-card py-5 px-4">
          <div className="page-not-found-inner prevent-select py-2">
            <div className="page-not-found-image-container">
              <h1 className="mb-0">404</h1>
              <p className="mb-0">{t("pageNotFound")}</p>
            </div>
          </div>
          <div className="page-not-found-inner pe-4 py-2">
            <h2 className="page-not-found-header mb-4">{t("oops")}</h2>
            <h4 className="page-not-found-title mb-4">
              {t("pageNotFoundTitle")}
            </h4>
            <p className="page-not-found-message mb-5 px-4">
              {t("pageNotFoundMessage")}
            </p>
            <button
              type="button"
              className="confirm-btn py-2"
              onClick={() => navigate("/")}
            >
              {t("gotoHomePage")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageNotFound;
