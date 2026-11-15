import React from 'react'
import './DonateBlood.css'
import BloodDonationHeartIcon from '../../../assets/images/BloodDonationHeartIcon.png'
import { useNavigate } from 'react-router-dom'

const DonateBlood = () => {
  const navigate = useNavigate()

  return (
    <section className="db-banner" aria-labelledby="db-heading">
      <div className="db-content">
        <h1 id="db-heading" className="db-title">
          <span className="db-top">Donate Blood</span>
          <span className="db-main">Save Lives.</span>

          <span className="db-day-row">
            <i aria-hidden="true" />
            <span className="db-day">Be Someone's Hope!</span>
            <i aria-hidden="true" />
          </span>
        </h1>

        <p className="db-text">
          A single donation can save up to three lives. Book a slot at the
          nearest blood bank.
        </p>

        <button
          className="db-btn"
          type="button"
          onClick={() => navigate('/donate-blood')}
        >
          Donate Blood
        </button>
      </div>

      <div className="db-art" aria-hidden="true">
        <img
          src={BloodDonationHeartIcon}
          alt=""
          loading="lazy"
          className="db-art-img"
        />
      </div>
    </section>
  )
}

export default DonateBlood