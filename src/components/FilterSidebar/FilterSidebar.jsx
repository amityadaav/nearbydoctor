import "./FilterSidebar.css";

import Select from "../../components/common/Select/Select";
import Input from "../../components/common/Input/Input";
import Button from "../common/Input/Input";

const FilterSidebar = () => {
  const specialties = [
    ["", "All Specialties"],
    ["cardiologist", "Cardiologist"],
    ["dermatologist", "Dermatologist"],
    ["dentist", "Dentist"],
    ["orthopedic", "Orthopedic"],
    ["general", "General Physician"],
  ];

  const consultationTypes = [
    ["", "Any"],
    ["clinic", "In Clinic"],
    ["video", "Video Consultation"],
  ];

  const genders = [
    ["", "Any"],
    ["female", "Female"],
    ["male", "Male"],
  ];

  const experiences = [
    ["", "Any Experience"],
    ["5", "5+ Years"],
    ["10", "10+ Years"],
    ["15", "15+ Years"],
  ];

  const ratings = [
    ["", "Any Rating"],
    ["4", "4.0+"],
    ["4.5", "4.5+"],
    ["4.8", "4.8+"],
  ];

  return (
    <aside className="filter-sidebar">

      {/* Header */}
      <div className="filter-header">
        <div>
          <h2>Filters</h2>
          <p>Refine your doctor search</p>
        </div>

        <button type="button" className="clear-filter">
          Clear all
        </button>
      </div>

      {/* Divider */}
      <div className="filter-divider" />

      {/* Specialty */}
      <div className="filter-item">
        <Select
          label="Specialty"
          options={specialties}
        />
      </div>

      {/* Consultation Type */}
      <div className="filter-item">
        <Select
          label="Consultation Type"
          options={consultationTypes}
        />
      </div>

      {/* Gender */}
      <div className="filter-item">
        <Select
          label="Gender"
          options={genders}
        />
      </div>

      {/* Experience */}
      <div className="filter-item">
        <Select
          label="Experience"
          options={experiences}
        />
      </div>

      {/* Rating */}
      <div className="filter-item">
        <Select
          label="Rating"
          options={ratings}
        />
      </div>

      {/* Fee */}
      <div className="filter-item fee-filter">
        <div className="fee-header">
          <label htmlFor="fee">
            Maximum consultation fee
          </label>

          <span className="fee-value">
            ₹2000
          </span>
        </div>

        <Input
          id="fee"
          type="range"
          min="300"
          max="2000"
          step="100"
          defaultValue="2000"
          className="fee-range"
        />

        <div className="fee-range-labels">
          <span>₹300</span>
          <span>₹2000</span>
        </div>
      </div>

      {/* Availability */}
      <label className="availability-filter">
        <input type="checkbox" />

        <span className="custom-checkbox">
          <span className="checkbox-check">✓</span>
        </span>

        <span className="availability-text">
          <strong>Available today</strong>
          <small>Show doctors available today</small>
        </span>
      </label>

      {/* Apply */}
      <div className="filter-actions">
        <Button size="sm">
          Apply Filters
        </Button>
      </div>

    </aside>
  );
};

export default FilterSidebar;