import React, { Fragment } from "react";
import PropTypes from "prop-types";
import Moment from "react-moment";
import { connect } from "react-redux";
import { deleteEducation } from "../../actions/profile";

const Education = ({ education, deleteEducation }) => {
  const educations = education.map((edu) => {
    return (
      <tr key={edu._id}>
        <td>{edu.school}</td>
        <td className="hide-sm">{edu.degree}</td>
        <td className="hide-sm">
          <Moment format="DD/MM/YYYY">{edu.from}</Moment> -{" "}
          {edu.to === null ? (
            "Present"
          ) : (
            <Moment format="DD/MM/YYYY">{edu.to}</Moment>
          )}
        </td>
        <td>
          <button
            className="btn btn-danger"
            onClick={() => deleteEducation(edu._id)}
          >
            Delete
          </button>
        </td>
      </tr>
    );
  });
  return (
    <Fragment>
      <h2 className="my-2">Education Credentials</h2>
      {education.length === 0 ? (
        <span>Please add Education Credentials</span>
      ) : (
        <Fragment>
          <table className="table">
            <thead>
              <tr>
                <th>School</th>
                <th className="hide-sm">Degree</th>
                <th className="hide-sm">Years</th>
                <th></th>
              </tr>
            </thead>
            <tbody>{educations}</tbody>
          </table>
        </Fragment>
      )}
    </Fragment>
  );
};

Education.propTypes = {
  education: PropTypes.array.isRequired,
  deleteEducation: PropTypes.func.isRequired,
};

export default connect(null, { deleteEducation })(Education);
