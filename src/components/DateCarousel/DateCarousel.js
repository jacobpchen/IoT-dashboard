import React from "react";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";
import moment from "moment-timezone";

const aggregationTypeMap = new Map([
    ["hour", "day"],
    ["day", "month"],
    ["month", "year"],
]);

const DateCarousel = (props) => {
    const changeDate = (aggregationType, date, dateOperator) => {
        let newDate = "";
        switch (aggregationType) {
            case "hour":
                newDate = moment(date).add(dateOperator, "day").valueOf();
                props.handleDateChange(newDate, 0);
                break;
            case "day":
                newDate = moment(date).add(dateOperator, "month").valueOf();
                props.handleDateChange(newDate, 1);
                break;
            case "month":
                newDate = moment(date).add(dateOperator, "year").valueOf();
                props.handleDateChange(newDate, 2);
                break;
            default:
                break;
        }
    };
    const formattedDate = (date, aggregationType) => {
        switch (aggregationType) {
            case "hour":
                return moment(date).format("MMM D, YYYY");
            case "day":
                return moment(date).format("MMM YYYY");
            case "month":
                return moment(date).format("YYYY");
            default:
                return;
        }
    };
    const isFuture = moment(props.date).isSameOrAfter(moment(), aggregationTypeMap.get(props.aggregationType));
    return (
        <div>
            <div className={"d-inline-block"} style={{ verticalAlign: "middle", height: "35px", width: "35px" }}>
                <ArrowBackIosIcon
                    fontSize="large"
                    style={{ cursor: "pointer" }}
                    onClick={() => changeDate(props.aggregationType, props.date, -1)}
                />
            </div>
            <div className={"d-inline-block"} style={{ textAlign: "center", marginTop: "10px" }}>
                {formattedDate(props.date, props.aggregationType)}
            </div>
            <div className={"d-inline-block"} style={{ verticalAlign: "middle", height: "35px", width: "35px" }}>
                {!isFuture && (
                    <ArrowForwardIosIcon
                        style={{ cursor: "pointer" }}
                        fontSize="large"
                        onClick={() => changeDate(props.aggregationType, props.date, 1)}
                    />
                )}{" "}
            </div>
        </div>
    );
};

export default DateCarousel;
