const baseTemplate = ({ title, preview, content }) => `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
  </head>
  <body style="margin:0;background:#f5f7fb;font-family:Arial,sans-serif;color:#172033;">
    <span style="display:none;color:transparent;opacity:0;height:0;width:0;">${preview}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fb;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#ffffff;border:1px solid #e6eaf2;border-radius:8px;overflow:hidden;">
            <tr>
              <td style="padding:24px 28px;background:#172033;color:#ffffff;">
                <h1 style="margin:0;font-size:22px;line-height:1.3;">CourseHub</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                ${content}
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px;background:#f8fafc;color:#667085;font-size:12px;">
                This message was sent by CourseHub.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

module.exports = baseTemplate;
