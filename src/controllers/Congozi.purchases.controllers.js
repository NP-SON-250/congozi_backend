import * as purchaseServices from "../services/Congozi.purchases.services";
import {
  validateCreatePurchase,
  validateUpdatePurchase,
} from "../validation/Congozi.purchases.validation";
export const purchasedItem = async (req, res) => {
  const { error, value } = validateCreatePurchase(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const userId = req.loggedInUser.id;
    const userRole = req.loggedInUser.role;
    const { itemId } = req.params;
    const result = await purchaseServices.makepayments(
      userId,
      userRole,
      itemId,
      value
    );
    return res.status(201).json({
      status: "201",
      message: "Purchase created",
      data: result,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "500",
      message: "Internal server error",
      error: err.message,
    });
  }
};
export const purchasedAndPaidItem = async (req, res) => {
  const { error, value } = validateCreatePurchase(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const userId = req.loggedInUser.id;
    const userRole = req.loggedInUser.role;
    const { itemId } = req.params;
    const result = await purchaseServices.makePaidpayments(
      userId,
      userRole,
      itemId,
      value
    );
    return res.status(201).json({
      status: "201",
      message: "Purchase and paid success",
      data: result,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "500",
      message: "Internal server error",
      error: err.message,
    });
  }
};

export const updatedPurchase = async (req, res) => {
  const { error, value } = validateUpdatePurchase(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  try {
    const { id } = req.params;
    const updatepayment = await purchaseServices.updatepayments(id, value);

    return res.status(200).json({
      message: "Purchase updated",
      data: updatepayment,
    });
  } catch (error) {
    res.status(500).json({
      status: "500",
      message: "Internal server error",
      error: error.message,
    });
  }
};
export const getUserPending = async (req, res) => {
  try {
    const userId = req.loggedInUser.id;
    const purchases = await purchaseServices.getPendingpayments(userId);

    return res.status(200).json({
      status: "200",
      message: "Purchases retrieved",
      data: purchases,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "500",
      message: "Internal server error",
      error: error.message,
    });
  }
};
export const getAllUserPayments = async (req, res) => {
  try {
    const userId = req.loggedInUser.id;
    const purchases = await purchaseServices.getAllPayments(userId);

    return res.status(200).json({
      status: "200",
      message: "Purchases retrieved",
      data: purchases,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "500",
      message: "Internal server error",
      error: error.message,
    });
  }
};
export const getUserComplete = async (req, res) => {
  try {
    const userId = req.loggedInUser.id;
    const purchases = await purchaseServices.getCompletepayments(userId);

    return res.status(200).json({
      status: "200",
      message: "Purchases retrieved",
      data: purchases,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "500",
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const examByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const userId = req.loggedInUser.id;
    const exams = await purchaseServices.getExamsByAccessCode(code, userId);

    return res.status(200).json({
      status: "200",
      message: "Exam retrieved by access code",
      data: exams,
    });
  } catch (error) {
    console.error(error);
    return res.status(404).json({
      status: "404",
      message: "Exam not found with the given access code",
      error: error.message,
    });
  }
};

export const getUserAdmin = async (req, res) => {
  try {
    const purchases = await purchaseServices.getAdminpayments();

    return res.status(200).json({
      status: "200",
      message: "Purchases retrieved",
      data: purchases,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "500",
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getUserPurchase = async (req, res) => {
  try {
    const userId = req.loggedInUser.id;
    const purchases = await purchaseServices.getUserspayments(userId);

    return res.status(200).json({
      status: "200",
      message: "Purchases retrieved",
      data: purchases,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "500",
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getLoggedInUserSinglePurchase = async (req, res) => {
  try {
    const userId = req.loggedInUser.id;
    const { purchaseId } = req.params;

    const purchase = await purchaseServices.getSingleUserPurchase(
      userId,
      purchaseId
    );

    return res.status(200).json({
      status: "200",
      message: "Purchase retrieved successfully",
      data: purchase,
    });
  } catch (error) {
    console.error(error);
    return res.status(404).json({
      status: "404",
      message: "Purchase not found",
      error: error.message,
    });
  }
};

export const deleteLoggedInUserPurchase = async (req, res) => {
  try {
    const { purchaseId } = req.params;

    const result = await purchaseServices.deleteUserpayments(purchaseId);

    return res.status(200).json({
      status: "200",
      message: "Purchase deleted",
      data: result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "500",
      message: "Purchase not found",
      error: error.message,
    });
  }
};

export const deleteAccessCodePurchase = async (req, res) => {
  try {
    const { accessCode } = req.params;

    const result = await purchaseServices.deleteUserpaymentsByAccessCode(
      accessCode
    );

    return res.status(200).json({
      status: "200",
      message: "Purchase deleted",
      data: result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "500",
      message: "Purchase not found",
      error: error.message,
    });
  }
};
