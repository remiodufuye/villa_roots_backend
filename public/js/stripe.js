import axios from "axios";
import { showAlert } from "./alerts";

const stripe = Stripe(
  "pk_test_51GqOa9F8IBbCpXSkur5zc17ZZFwNDqXECux9PigEBYrlI5bVHVMVvDEyK1Awx6k4znR4Ba01OokQozcp61noUcNL00YvKaW4AI"
);

export const bookCourse = async (courseId) => {
  try {
    // 1) Get Checkout session from API
    const session = await axios(
      `/api/v1/bookings/checkout-session/${courseId}`
    );

    console.log(session);
    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert("error", err);
  }
};
