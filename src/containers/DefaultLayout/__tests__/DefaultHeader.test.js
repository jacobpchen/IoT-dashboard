import React from "react";
import ReactDOM from "react-dom";
import { MemoryRouter } from "react-router-dom";
import DefaultHeader from "../DefaultHeader";
import i18n from "../../../i18nForTest";
import { I18nextProvider } from "react-i18next";

it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(
        <MemoryRouter>
            <I18nextProvider i18n={i18n}>
                <DefaultHeader />
            </I18nextProvider>
        </MemoryRouter>,
        div
    );
    ReactDOM.unmountComponentAtNode(div);
});
