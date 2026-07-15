const crypto = require("crypto");

const calculateHmac = (obj) => {
  const fields = [
    obj.amount_cents,
    obj.created_at,
    obj.currency,
    obj.error_occured,
    obj.has_parent_transaction,
    obj.id,
    obj.integration_id,
    obj.is_3d_secure,
    obj.is_auth,
    obj.is_capture,
    obj.is_refunded,
    obj.is_standalone_payment,
    obj.is_voided,
    obj.order?.id,
    obj.owner,
    obj.pending,
    obj.source_data?.pan,
    obj.source_data?.sub_type,
    obj.source_data?.type,
    obj.success,
  ];

  const concatenated = fields
    .map((field) =>
      field === null || field === undefined ? "" : String(field),
    )
    .join("");

  return crypto
    .createHmac("sha512", process.env.PAYMOB_HMAC)
    .update(concatenated)
    .digest("hex");
};

module.exports = calculateHmac;
