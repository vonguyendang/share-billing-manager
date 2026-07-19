export default function cancelUserTemplate(data: any) {
    return {
        vi: {
            subject: `[Xác nhận] Đã ghi nhận yêu cầu Hủy gia hạn - ${data.plan_name}`,
            body: `Chào ${data.full_name},\n\nHệ thống đã ghi nhận yêu cầu Hủy gia hạn gói dịch vụ ${data.plan_name} của bạn.\nBạn vẫn có thể tiếp tục sử dụng dịch vụ cho đến ngày đến hạn tiếp theo. Sau ngày đó, hệ thống sẽ tự động ngắt quyền truy cập của bạn.\n\nThông tin liên hệ Admin:\n- Zalo/SĐT: 0944353323\n- Email: vndang96@gmail.com\n- FB: https://www.facebook.com/iamnguyendang\n\nCảm ơn bạn đã sử dụng dịch vụ!`,
            htmlBody: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #EF4444; padding: 20px; text-align: center;">
                    <h2 style="color: white; margin: 0;">Đã ghi nhận yêu cầu Hủy gia hạn</h2>
                </div>
                <div style="padding: 30px; background-color: #ffffff;">
                    <h3 style="color: #111827; margin-top: 0;">Chào ${data.full_name},</h3>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Hệ thống đã ghi nhận yêu cầu <strong>Hủy gia hạn</strong> của bạn cho gói dịch vụ <strong>${data.plan_name}</strong>.</p>
                    
                    <div style="background-color: #FEF2F2; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #FECACA;">
                        <p style="margin: 0; color: #991B1B; text-align: center;">Bạn vẫn có thể sử dụng dịch vụ đến hết chu kỳ hiện tại.</p>
                    </div>
                    
                    <p style="color: #4b5563; font-size: 16px;">Tới ngày đến hạn, hệ thống sẽ tự động ngắt quyền truy cập của bạn vào dịch vụ này.</p>
                    
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                    <div style="font-size: 14px; color: #4b5563; background-color: #f9fafb; padding: 15px; border-radius: 6px;">
                        <p style="margin: 0 0 10px 0;"><strong>Thông tin liên hệ Admin (Nếu cần hỗ trợ thêm):</strong></p>
                        <p style="margin: 5px 0;">📞 Zalo/SĐT: <strong>0944353323</strong></p>
                        <p style="margin: 5px 0;">📧 Email: <a href="mailto:vndang96@gmail.com" style="color: #1a73e8;">vndang96@gmail.com</a></p>
                        <p style="margin: 5px 0;">🌐 Facebook: <a href="https://www.facebook.com/iamnguyendang" style="color: #1a73e8;" target="_blank">iamnguyendang</a></p>
                    </div>
                </div>
            </div>
            `,
            tgMessage: ''
        },
        en: {
            subject: `[Confirmed] Cancellation Request Received - ${data.plan_name}`,
            body: `Hi ${data.full_name},\n\nWe have received your cancellation request for the ${data.plan_name} plan.\nYou can continue using the service until your next due date. After that, your access will be automatically revoked.\n\nAdmin Contact:\n- Zalo/Phone: 0944353323\n- Email: vndang96@gmail.com\n- FB: https://www.facebook.com/iamnguyendang\n\nThank you for using our service!`,
            htmlBody: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #EF4444; padding: 20px; text-align: center;">
                    <h2 style="color: white; margin: 0;">Cancellation Request Confirmed</h2>
                </div>
                <div style="padding: 30px; background-color: #ffffff;">
                    <h3 style="color: #111827; margin-top: 0;">Hi ${data.full_name},</h3>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">We have received your <strong>Cancellation Request</strong> for the <strong>${data.plan_name}</strong> plan.</p>
                    
                    <div style="background-color: #FEF2F2; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #FECACA;">
                        <p style="margin: 0; color: #991B1B; text-align: center;">You can continue using the service until the end of your current cycle.</p>
                    </div>
                    
                    <p style="color: #4b5563; font-size: 16px;">On the due date, your access to this service will be automatically revoked.</p>
                    
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                    <div style="font-size: 14px; color: #4b5563; background-color: #f9fafb; padding: 15px; border-radius: 6px;">
                        <p style="margin: 0 0 10px 0;"><strong>Admin Contact (If you need further assistance):</strong></p>
                        <p style="margin: 5px 0;">📞 Zalo/Phone: <strong>0944353323</strong></p>
                        <p style="margin: 5px 0;">📧 Email: <a href="mailto:vndang96@gmail.com" style="color: #1a73e8;">vndang96@gmail.com</a></p>
                        <p style="margin: 5px 0;">🌐 Facebook: <a href="https://www.facebook.com/iamnguyendang" style="color: #1a73e8;" target="_blank">iamnguyendang</a></p>
                    </div>
                </div>
            </div>
            `,
            tgMessage: ''
        }
    };
}
