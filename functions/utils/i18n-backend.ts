export function getNotificationContent(lang: string, type: 'cancel_user' | 'cancel_admin' | 'payment_admin' | 'payment_user' | 'payment_approve' | 'payment_reject' | 'payment_undo' | 'reminder' | 'reminder_admin', data: any): { subject?: string, body?: string, htmlBody?: string, tgMessage?: string } {
    let vi = { subject: '', body: '', htmlBody: '', tgMessage: '' };
    let en = { subject: '', body: '', htmlBody: '', tgMessage: '' };

    if (type === 'cancel_user') {
        vi = {
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
        };
        
        en = {
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
        };
    } else if (type === 'cancel_admin') {
        vi = {
            subject: `[Thông báo] Khách hàng ${data.full_name} hủy gia hạn gói ${data.plan_name}`,
            body: `Khách hàng ${data.full_name} yêu cầu hủy gia hạn.\n\nGói: ${data.plan_name}\n\nKhách hàng không muốn gia hạn chu kỳ sau. Hệ thống sẽ tự động hủy quyền khi đến hạn. Vui lòng kiểm tra trên trang quản trị.`,
            htmlBody: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #EF4444; padding: 20px; text-align: center;">
                    <h2 style="color: white; margin: 0;">Khách hàng yêu cầu hủy gia hạn ⚠️</h2>
                </div>
                <div style="padding: 30px; background-color: #ffffff;">
                    <p><strong>Khách hàng:</strong> ${data.full_name}</p>
                    <p><strong>Gói:</strong> ${data.plan_name}</p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                    <p>Khách hàng không muốn gia hạn chu kỳ sau. Tới ngày đến hạn, hãy ngắt quyền truy cập của khách hàng này.</p>
                </div>
            </div>
            `,
            tgMessage: `⚠️ <b>Khách hàng yêu cầu hủy gia hạn</b>\n👤 Khách hàng: <b>${data.full_name}</b>\n📦 Gói: <b>${data.plan_name}</b>\n\n👉 Khách hàng không muốn gia hạn chu kỳ sau. Hệ thống sẽ tự động hủy quyền khi đến hạn.`
        };
        
        en = {
            subject: `[Notice] Customer ${data.full_name} cancelled renewal for ${data.plan_name}`,
            body: `Customer ${data.full_name} requested to cancel renewal.\n\nPlan: ${data.plan_name}\n\nCustomer doesn't want to renew for the next cycle. The system will auto-revoke access on the due date. Please check the admin dashboard.`,
            htmlBody: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #EF4444; padding: 20px; text-align: center;">
                    <h2 style="color: white; margin: 0;">Customer Cancellation Request ⚠️</h2>
                </div>
                <div style="padding: 30px; background-color: #ffffff;">
                    <p><strong>Customer:</strong> ${data.full_name}</p>
                    <p><strong>Plan:</strong> ${data.plan_name}</p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                    <p>The customer doesn't want to renew for the next cycle. Please revoke their access on the due date.</p>
                </div>
            </div>
            `,
            tgMessage: `⚠️ <b>Cancellation Request</b>\n👤 Customer: <b>${data.full_name}</b>\n📦 Plan: <b>${data.plan_name}</b>\n\n👉 Customer doesn't want to renew. Auto-revoke will happen on due date.`
        };
    } else if (type === 'payment_user') {
        vi = {
            subject: `[Đã ghi nhận] Yêu cầu thanh toán - ${data.plan_name}`,
            body: `Chào ${data.full_name},\n\nHệ thống đã ghi nhận yêu cầu báo thanh toán của bạn.\nVui lòng chờ admin kiểm tra và duyệt nhé.\n\nThông tin liên hệ Admin:\n- Zalo/SĐT: 0944353323\n- Email: vndang96@gmail.com\n- FB: https://www.facebook.com/iamnguyendang\n\nCảm ơn bạn!`,
            htmlBody: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #3B82F6; padding: 20px; text-align: center;">
                    <h2 style="color: white; margin: 0;">Yêu cầu đã được ghi nhận ⏳</h2>
                </div>
                <div style="padding: 30px; background-color: #ffffff;">
                    <h3 style="color: #111827; margin-top: 0;">Chào ${data.full_name},</h3>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Hệ thống đã ghi nhận yêu cầu báo thanh toán của bạn cho gói dịch vụ <strong>${data.plan_name}</strong>.</p>
                    
                    <div style="background-color: #EFF6FF; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #BFDBFE;">
                        <p style="margin: 0; color: #1E40AF; text-align: center;">Trạng thái: <strong>Đang chờ Admin duyệt</strong></p>
                    </div>
                    
                    <p style="color: #4b5563; font-size: 16px;">Vui lòng chờ Admin kiểm tra tài khoản và xác nhận trong thời gian sớm nhất. Hệ thống sẽ tự động thông báo cho bạn ngay khi khoản thanh toán được duyệt.</p>
                    
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                    <div style="font-size: 14px; color: #4b5563; background-color: #f9fafb; padding: 15px; border-radius: 6px;">
                        <p style="margin: 0 0 10px 0;"><strong>Thông tin liên hệ Admin:</strong></p>
                        <p style="margin: 5px 0;">📞 Zalo/SĐT: <strong>0944353323</strong></p>
                        <p style="margin: 5px 0;">📧 Email: <a href="mailto:vndang96@gmail.com" style="color: #1a73e8;">vndang96@gmail.com</a></p>
                        <p style="margin: 5px 0;">🌐 Facebook: <a href="https://www.facebook.com/iamnguyendang" style="color: #1a73e8;" target="_blank">iamnguyendang</a></p>
                    </div>
                </div>
            </div>
            `,
            tgMessage: ''
        };

        en = {
            subject: `[Received] Payment Request - ${data.plan_name}`,
            body: `Hi ${data.full_name},\n\nWe have received your payment request.\nPlease wait while the admin reviews and approves it.\n\nAdmin Contact:\n- Zalo/Phone: 0944353323\n- Email: vndang96@gmail.com\n- FB: https://www.facebook.com/iamnguyendang\n\nThank you!`,
            htmlBody: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #3B82F6; padding: 20px; text-align: center;">
                    <h2 style="color: white; margin: 0;">Request Received ⏳</h2>
                </div>
                <div style="padding: 30px; background-color: #ffffff;">
                    <h3 style="color: #111827; margin-top: 0;">Hi ${data.full_name},</h3>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">We have successfully received your payment request for the <strong>${data.plan_name}</strong> plan.</p>
                    
                    <div style="background-color: #EFF6FF; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #BFDBFE;">
                        <p style="margin: 0; color: #1E40AF; text-align: center;">Status: <strong>Waiting for Admin Approval</strong></p>
                    </div>
                    
                    <p style="color: #4b5563; font-size: 16px;">Please allow some time for the admin to review and verify your payment. You will be notified automatically once it is approved.</p>
                    
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                    <div style="font-size: 14px; color: #4b5563; background-color: #f9fafb; padding: 15px; border-radius: 6px;">
                        <p style="margin: 0 0 10px 0;"><strong>Admin Contact:</strong></p>
                        <p style="margin: 5px 0;">📞 Zalo/Phone: <strong>0944353323</strong></p>
                        <p style="margin: 5px 0;">📧 Email: <a href="mailto:vndang96@gmail.com" style="color: #1a73e8;">vndang96@gmail.com</a></p>
                        <p style="margin: 5px 0;">🌐 Facebook: <a href="https://www.facebook.com/iamnguyendang" style="color: #1a73e8;" target="_blank">iamnguyendang</a></p>
                    </div>
                </div>
            </div>
            `,
            tgMessage: ''
        };
    } else if (type === 'payment_admin') {
        const noteVi = data.user_note ? `\n📝 Ghi chú: <i>${data.user_note}</i>` : '';
        const noteEn = data.user_note ? `\n📝 Note: <i>${data.user_note}</i>` : '';
        const amountStr = data.amount.toLocaleString();
        
        vi = {
            subject: `[Thanh toán] Yêu cầu mới từ ${data.full_name} - ${data.plan_name}`,
            body: `Có yêu cầu thanh toán mới từ ${data.full_name}.\n\nKhách hàng: ${data.full_name}\nGói: ${data.plan_name}\nSố tiền: ${amountStr}đ\nGhi chú: ${data.user_note || 'Không có'}\n\nVui lòng vào trang quản trị để kiểm tra và duyệt.`,
            htmlBody: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #F59E0B; padding: 20px; text-align: center;">
                    <h2 style="color: white; margin: 0;">Yêu cầu thanh toán mới 🔔</h2>
                </div>
                <div style="padding: 30px; background-color: #ffffff;">
                    <p><strong>Khách hàng:</strong> ${data.full_name}</p>
                    <p><strong>Gói:</strong> ${data.plan_name}</p>
                    <p><strong>Số tiền:</strong> ${amountStr} VNĐ</p>
                    <p><strong>Ghi chú:</strong> ${data.user_note || 'Không có'}</p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                    <p>Vui lòng vào trang quản trị để kiểm tra và duyệt.</p>
                </div>
            </div>
            `,
            tgMessage: `🔔 <b>Yêu cầu thanh toán mới</b>\n👤 Khách hàng: <b>${data.full_name}</b>\n📦 Gói: <b>${data.plan_name}</b>\n💰 Số tiền: <b>${amountStr}đ</b>${noteVi}\n\n👉 Vui lòng vào trang quản trị để kiểm tra và duyệt.`
        };
        
        en = {
            subject: `[Payment] New request from ${data.full_name} - ${data.plan_name}`,
            body: `New payment request from ${data.full_name}.\n\nCustomer: ${data.full_name}\nPlan: ${data.plan_name}\nAmount: ${amountStr} VND\nNote: ${data.user_note || 'None'}\n\nPlease check the admin dashboard to verify.`,
            htmlBody: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #F59E0B; padding: 20px; text-align: center;">
                    <h2 style="color: white; margin: 0;">New Payment Request 🔔</h2>
                </div>
                <div style="padding: 30px; background-color: #ffffff;">
                    <p><strong>Customer:</strong> ${data.full_name}</p>
                    <p><strong>Plan:</strong> ${data.plan_name}</p>
                    <p><strong>Amount:</strong> ${amountStr} VND</p>
                    <p><strong>Note:</strong> ${data.user_note || 'None'}</p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                    <p>Please log in to the admin dashboard to review and approve.</p>
                </div>
            </div>
            `,
            tgMessage: `🔔 <b>New Payment Request</b>\n👤 Customer: <b>${data.full_name}</b>\n📦 Plan: <b>${data.plan_name}</b>\n💰 Amount: <b>${amountStr} VND</b>${noteEn}\n\n👉 Please verify on the admin dashboard.`
        };

    } else if (type === 'payment_approve') {
        vi = {
            subject: `[Xác nhận] Thanh toán thành công - ${data.plan_name}`,
            body: `Chào ${data.full_name},\n\nAdmin đã xác nhận thanh toán thành công số tiền ${data.totalPaid} VNĐ cho gói ${data.plan_name}.\nHạn dùng tiếp theo của bạn là: ${data.formattedNewDate}.\n\nThông tin liên hệ Admin:\n- Zalo/SĐT: 0944353323\n- Email: vndang96@gmail.com\n- FB: https://www.facebook.com/iamnguyendang\n\nCảm ơn bạn!`,
            htmlBody: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #10B981; padding: 20px; text-align: center;">
                    <h2 style="color: white; margin: 0;">Thanh Toán Thành Công 🎉</h2>
                </div>
                <div style="padding: 30px; background-color: #ffffff;">
                    <h3 style="color: #111827; margin-top: 0;">Chào ${data.full_name},</h3>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Admin đã nhận được khoản thanh toán của bạn cho gói dịch vụ <strong>${data.plan_name}</strong>.</p>
                    
                    <div style="background-color: #F0FDF4; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #A7F3D0;">
                        <p style="margin: 5px 0; color: #065F46;"><strong>Số tiền đã thanh toán:</strong> ${data.totalPaid} VNĐ</p>
                        <p style="margin: 5px 0; color: #065F46;"><strong>Ngày đến hạn tiếp theo:</strong> <span style="font-size: 18px; font-weight: bold;">${data.formattedNewDate}</span></p>
                    </div>
                    
                    <p style="color: #4b5563; font-size: 16px;">Chúc bạn có những trải nghiệm tuyệt vời cùng gia đình và bạn bè!</p>
                    
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                    <div style="font-size: 14px; color: #4b5563; background-color: #f9fafb; padding: 15px; border-radius: 6px;">
                        <p style="margin: 0 0 10px 0;"><strong>Thông tin liên hệ Admin:</strong></p>
                        <p style="margin: 5px 0;">📞 Zalo/SĐT: <strong>0944353323</strong></p>
                        <p style="margin: 5px 0;">📧 Email: <a href="mailto:vndang96@gmail.com" style="color: #1a73e8;">vndang96@gmail.com</a></p>
                        <p style="margin: 5px 0;">🌐 Facebook: <a href="https://www.facebook.com/iamnguyendang" style="color: #1a73e8;" target="_blank">iamnguyendang</a></p>
                    </div>
                </div>
            </div>
            `,
            tgMessage: `✅ <b>Đã duyệt thanh toán</b>\n👤 Khách hàng: <b>${data.full_name}</b>\n📦 Gói: <b>${data.plan_name}</b>\n💰 Số tiền: <b>${data.totalPaid}đ</b>\n📅 Hạn mới: <b>${data.formattedNewDate}</b>`
        };

        en = {
            subject: `[Confirmed] Payment Successful - ${data.plan_name}`,
            body: `Hi ${data.full_name},\n\nThe admin has successfully verified your payment of ${data.totalPaid} VND for the ${data.plan_name} plan.\nYour next due date is: ${data.formattedNewDate}.\n\nAdmin Contact:\n- Zalo/Phone: 0944353323\n- Email: vndang96@gmail.com\n- FB: https://www.facebook.com/iamnguyendang\n\nThank you!`,
            htmlBody: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #10B981; padding: 20px; text-align: center;">
                    <h2 style="color: white; margin: 0;">Payment Successful 🎉</h2>
                </div>
                <div style="padding: 30px; background-color: #ffffff;">
                    <h3 style="color: #111827; margin-top: 0;">Hi ${data.full_name},</h3>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">The admin has received your payment for the <strong>${data.plan_name}</strong> plan.</p>
                    
                    <div style="background-color: #F0FDF4; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #A7F3D0;">
                        <p style="margin: 5px 0; color: #065F46;"><strong>Amount Paid:</strong> ${data.totalPaid} VND</p>
                        <p style="margin: 5px 0; color: #065F46;"><strong>Next Due Date:</strong> <span style="font-size: 18px; font-weight: bold;">${data.formattedNewDate}</span></p>
                    </div>
                    
                    <p style="color: #4b5563; font-size: 16px;">We hope you enjoy your experience with family and friends!</p>
                    
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                    <div style="font-size: 14px; color: #4b5563; background-color: #f9fafb; padding: 15px; border-radius: 6px;">
                        <p style="margin: 0 0 10px 0;"><strong>Admin Contact:</strong></p>
                        <p style="margin: 5px 0;">📞 Zalo/Phone: <strong>0944353323</strong></p>
                        <p style="margin: 5px 0;">📧 Email: <a href="mailto:vndang96@gmail.com" style="color: #1a73e8;">vndang96@gmail.com</a></p>
                        <p style="margin: 5px 0;">🌐 Facebook: <a href="https://www.facebook.com/iamnguyendang" style="color: #1a73e8;" target="_blank">iamnguyendang</a></p>
                    </div>
                </div>
            </div>
            `,
            tgMessage: `✅ <b>Payment Approved</b>\n👤 Customer: <b>${data.full_name}</b>\n📦 Plan: <b>${data.plan_name}</b>\n💰 Amount: <b>${data.totalPaid} VND</b>\n📅 New Due Date: <b>${data.formattedNewDate}</b>`
        };
    } else if (type === 'payment_reject') {
        vi = {
            subject: `[Từ chối] Yêu cầu thanh toán - ${data.plan_name}`,
            body: `Chào ${data.full_name},\n\nAdmin đã TỪ CHỐI yêu cầu báo thanh toán của bạn cho gói ${data.plan_name}.\nLý do: ${data.rejectReason}\n\nVui lòng kiểm tra lại. Nếu có sai sót, bạn có thể gửi lại báo cáo thanh toán mới hoặc liên hệ Admin.\n\nThông tin liên hệ Admin:\n- Zalo/SĐT: 0944353323\n- Email: vndang96@gmail.com\n- FB: https://www.facebook.com/iamnguyendang\n\nCảm ơn bạn!`,
            htmlBody: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #EF4444; padding: 20px; text-align: center;">
                    <h2 style="color: white; margin: 0;">Từ Chối Thanh Toán ❌</h2>
                </div>
                <div style="padding: 30px; background-color: #ffffff;">
                    <h3 style="color: #111827; margin-top: 0;">Chào ${data.full_name},</h3>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Rất tiếc, Admin đã <strong>từ chối</strong> yêu cầu báo thanh toán của bạn cho gói dịch vụ <strong>${data.plan_name}</strong>.</p>
                    
                    <div style="background-color: #FEF2F2; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #FCA5A5;">
                        <p style="margin: 5px 0; color: #991B1B;"><strong>Lý do từ chối:</strong></p>
                        <p style="margin: 5px 0; color: #991B1B; font-style: italic;">"${data.rejectReason}"</p>
                    </div>
                    
                    <p style="color: #4b5563; font-size: 16px;">Vui lòng kiểm tra lại giao dịch ngân hàng của bạn. Nếu có sai sót, bạn có thể truy cập lại đường link Portal để gửi báo cáo thanh toán mới, hoặc liên hệ trực tiếp với Admin.</p>
                    
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                    <div style="font-size: 14px; color: #4b5563; background-color: #f9fafb; padding: 15px; border-radius: 6px;">
                        <p style="margin: 0 0 10px 0;"><strong>Thông tin liên hệ Admin:</strong></p>
                        <p style="margin: 5px 0;">📞 Zalo/SĐT: <strong>0944353323</strong></p>
                        <p style="margin: 5px 0;">📧 Email: <a href="mailto:vndang96@gmail.com" style="color: #1a73e8;">vndang96@gmail.com</a></p>
                        <p style="margin: 5px 0;">🌐 Facebook: <a href="https://www.facebook.com/iamnguyendang" style="color: #1a73e8;" target="_blank">iamnguyendang</a></p>
                    </div>
                </div>
            </div>
            `,
            tgMessage: `❌ <b>Đã từ chối thanh toán</b>\n👤 Khách hàng: <b>${data.full_name}</b>\n📦 Gói: <b>${data.plan_name}</b>\n💬 Lý do: <i>${data.rejectReason}</i>`
        };

        en = {
            subject: `[Rejected] Payment Request - ${data.plan_name}`,
            body: `Hi ${data.full_name},\n\nThe admin has REJECTED your payment request for the ${data.plan_name} plan.\nReason: ${data.rejectReason}\n\nPlease check your bank transaction. If there was a mistake, you can submit a new payment report or contact the Admin.\n\nAdmin Contact:\n- Zalo/Phone: 0944353323\n- Email: vndang96@gmail.com\n- FB: https://www.facebook.com/iamnguyendang\n\nThank you!`,
            htmlBody: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #EF4444; padding: 20px; text-align: center;">
                    <h2 style="color: white; margin: 0;">Payment Rejected ❌</h2>
                </div>
                <div style="padding: 30px; background-color: #ffffff;">
                    <h3 style="color: #111827; margin-top: 0;">Hi ${data.full_name},</h3>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">Unfortunately, the admin has <strong>rejected</strong> your payment request for the <strong>${data.plan_name}</strong> plan.</p>
                    
                    <div style="background-color: #FEF2F2; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #FCA5A5;">
                        <p style="margin: 5px 0; color: #991B1B;"><strong>Reason for rejection:</strong></p>
                        <p style="margin: 5px 0; color: #991B1B; font-style: italic;">"${data.rejectReason}"</p>
                    </div>
                    
                    <p style="color: #4b5563; font-size: 16px;">Please double-check your bank transactions. If this is a mistake, you can visit the Portal to submit a new payment report, or contact the admin directly.</p>
                    
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                    <div style="font-size: 14px; color: #4b5563; background-color: #f9fafb; padding: 15px; border-radius: 6px;">
                        <p style="margin: 0 0 10px 0;"><strong>Admin Contact:</strong></p>
                        <p style="margin: 5px 0;">📞 Zalo/Phone: <strong>0944353323</strong></p>
                        <p style="margin: 5px 0;">📧 Email: <a href="mailto:vndang96@gmail.com" style="color: #1a73e8;">vndang96@gmail.com</a></p>
                        <p style="margin: 5px 0;">🌐 Facebook: <a href="https://www.facebook.com/iamnguyendang" style="color: #1a73e8;" target="_blank">iamnguyendang</a></p>
                    </div>
                </div>
            </div>
            `,
            tgMessage: `❌ <b>Payment Rejected</b>\n👤 Customer: <b>${data.full_name}</b>\n📦 Plan: <b>${data.plan_name}</b>\n💬 Reason: <i>${data.rejectReason}</i>`
        };

    } else if (type === 'payment_undo') {
        const amountStr = data.amount.toLocaleString();
        vi = { subject: '', body: '', htmlBody: '', tgMessage: `⚠️ <b>Hoàn tác giao dịch duyệt nhầm</b>\n👤 Khách hàng: <b>${data.full_name}</b>\n💰 Số tiền bị hủy: <b>${amountStr}đ</b>\n📅 Ngày tới hạn trả về: <b>${data.newDateStr}</b>` };
        en = { subject: '', body: '', htmlBody: '', tgMessage: `⚠️ <b>Undo Approved Transaction</b>\n👤 Customer: <b>${data.full_name}</b>\n💰 Amount reverted: <b>${amountStr} VND</b>\n📅 Restored due date: <b>${data.newDateStr}</b>` };

    } else if (type === 'reminder') {
        let emailSubjectVi = '';
        let titleHtmlVi = '';
        let messageHtmlVi = '';

        let emailSubjectEn = '';
        let titleHtmlEn = '';
        let messageHtmlEn = '';

        let headerColor = '#4F46E5';

        if (data.days_left > 0) {
            emailSubjectVi = `[Nhắc nhở] Sắp đến hạn thanh toán - ${data.plan_name}`;
            titleHtmlVi = `Sắp đến hạn thanh toán`;
            messageHtmlVi = `Gói dịch vụ <strong>${data.plan_name}</strong> của bạn sắp đến hạn thanh toán.
            <br/><br/>
            <strong>Ngày đến hạn:</strong> <span style="color: #EF4444;">${data.formattedDate}</span> (còn ${data.days_left} ngày)<br/>
            <strong>Số tiền cần thanh toán:</strong> <span style="font-size: 18px; font-weight: bold; color: #10B981;">${data.amount_due} VNĐ</span>
            <br/><br/>
            Vui lòng thanh toán trước ngày hạn chót <strong>${data.formattedDeadline}</strong> để đảm bảo dịch vụ được duy trì liên tục.`;

            emailSubjectEn = `[Reminder] Upcoming Payment - ${data.plan_name}`;
            titleHtmlEn = `Upcoming Payment`;
            messageHtmlEn = `Your subscription for the <strong>${data.plan_name}</strong> plan is nearing its due date.
            <br/><br/>
            <strong>Due Date:</strong> <span style="color: #EF4444;">${data.formattedDate}</span> (${data.days_left} days left)<br/>
            <strong>Amount Due:</strong> <span style="font-size: 18px; font-weight: bold; color: #10B981;">${data.amount_due} VND</span>
            <br/><br/>
            Please make your payment before the deadline on <strong>${data.formattedDeadline}</strong> to ensure uninterrupted service.`;

        } else if (data.days_left === 0) {
            emailSubjectVi = `[Thông báo] Hôm nay là ngày đến hạn thanh toán - ${data.plan_name}`;
            titleHtmlVi = `Đến hạn thanh toán`;
            headerColor = '#F59E0B'; // Amber
            messageHtmlVi = `Hôm nay (<strong>${data.formattedDate}</strong>) là ngày đến hạn thanh toán gói dịch vụ <strong>${data.plan_name}</strong> của bạn.
            <br/><br/>
            <strong>Số tiền cần thanh toán:</strong> <span style="font-size: 18px; font-weight: bold; color: #10B981;">${data.amount_due} VNĐ</span>
            <br/><br/>
            Vui lòng thanh toán sớm trước ngày <strong>${data.formattedDeadline}</strong> để không bị gián đoạn dịch vụ nhé!`;

            emailSubjectEn = `[Notice] Payment is Due Today - ${data.plan_name}`;
            titleHtmlEn = `Payment Due Today`;
            messageHtmlEn = `Today (<strong>${data.formattedDate}</strong>) is the due date for your <strong>${data.plan_name}</strong> subscription.
            <br/><br/>
            <strong>Amount Due:</strong> <span style="font-size: 18px; font-weight: bold; color: #10B981;">${data.amount_due} VND</span>
            <br/><br/>
            Please pay before <strong>${data.formattedDeadline}</strong> to avoid any service interruption.`;

        } else if (data.days_left === -2) {
            emailSubjectVi = `[Quan trọng] Đã trễ hạn thanh toán 2 ngày - ${data.plan_name}`;
            titleHtmlVi = `Trễ hạn thanh toán`;
            headerColor = '#EF4444'; // Red
            messageHtmlVi = `Gói dịch vụ <strong>${data.plan_name}</strong> của bạn đã trễ hạn thanh toán 2 ngày (từ ngày ${data.formattedDate}).
            <br/><br/>
            <strong>Số tiền cần thanh toán:</strong> <span style="font-size: 18px; font-weight: bold; color: #10B981;">${data.amount_due} VNĐ</span>
            <br/><br/>
            Hạn chót để giữ lại dịch vụ là ngày <strong>${data.formattedDeadline}</strong>. Xin vui lòng thanh toán ngay để tránh bị hệ thống tự động khóa.`;

            emailSubjectEn = `[Important] Payment is 2 Days Overdue - ${data.plan_name}`;
            titleHtmlEn = `Payment Overdue`;
            messageHtmlEn = `Your subscription for the <strong>${data.plan_name}</strong> plan is 2 days overdue (since ${data.formattedDate}).
            <br/><br/>
            <strong>Amount Due:</strong> <span style="font-size: 18px; font-weight: bold; color: #10B981;">${data.amount_due} VND</span>
            <br/><br/>
            The absolute deadline to keep your service active is <strong>${data.formattedDeadline}</strong>. Please pay immediately to prevent automatic suspension.`;

        } else if (data.days_left === -4) {
            emailSubjectVi = `[Ngưng dịch vụ] Tài khoản của bạn đã bị khóa do trễ hạn - ${data.plan_name}`;
            titleHtmlVi = `Dịch vụ bị tạm ngưng`;
            headerColor = '#111827'; // Dark gray/black
            messageHtmlVi = `Rất tiếc, do đã trễ hạn thanh toán 4 ngày, hệ thống đã <strong>tự động tạm ngưng</strong> dịch vụ của bạn đối với gói <strong>${data.plan_name}</strong>.
            <br/><br/>
            <strong>Số tiền còn nợ:</strong> <span style="font-size: 18px; font-weight: bold; color: #EF4444;">${data.amount_due} VNĐ</span>
            <br/><br/>
            Vui lòng thanh toán khoản nợ và báo cho Admin để được kích hoạt lại dịch vụ. Cảm ơn bạn.`;

            emailSubjectEn = `[Suspended] Your Account has been Suspended - ${data.plan_name}`;
            titleHtmlEn = `Service Suspended`;
            messageHtmlEn = `Unfortunately, as your payment is 4 days overdue, your subscription for the <strong>${data.plan_name}</strong> plan has been <strong>automatically suspended</strong>.
            <br/><br/>
            <strong>Outstanding Balance:</strong> <span style="font-size: 18px; font-weight: bold; color: #EF4444;">${data.amount_due} VND</span>
            <br/><br/>
            Please clear your balance and contact the Admin to reactivate your service. Thank you.`;
        }

        const emailBodyVi = messageHtmlVi.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ');
        const emailBodyEn = messageHtmlEn.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ');

        vi = {
            subject: emailSubjectVi,
            body: emailBodyVi,
            htmlBody: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <div style="background-color: ${headerColor}; padding: 20px; text-align: center;">
                    <h2 style="color: white; margin: 0;">${titleHtmlVi}</h2>
                </div>
                <div style="padding: 30px; background-color: #ffffff;">
                    <h3 style="color: #111827; margin-top: 0;">Chào ${data.full_name},</h3>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">${messageHtmlVi}</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${data.actualLink}" style="background-color: #4F46E5; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">Xem Chi Tiết & Thanh Toán</a>
                    </div>
                    
                    <p style="color: #6B7280; font-size: 14px; text-align: center;">Nếu bạn đã thanh toán, vui lòng nhấn vào nút bên trên để báo cáo cho Admin.</p>
                    
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                    <div style="font-size: 14px; color: #4b5563; background-color: #f9fafb; padding: 15px; border-radius: 6px;">
                        <p style="margin: 0 0 10px 0;"><strong>Thông tin liên hệ Admin:</strong></p>
                        <p style="margin: 5px 0;">📞 Zalo/SĐT: <strong>0944353323</strong></p>
                        <p style="margin: 5px 0;">📧 Email: <a href="mailto:vndang96@gmail.com" style="color: #1a73e8;">vndang96@gmail.com</a></p>
                        <p style="margin: 5px 0;">🌐 Facebook: <a href="https://www.facebook.com/iamnguyendang" style="color: #1a73e8;" target="_blank">iamnguyendang</a></p>
                    </div>
                </div>
            </div>
            `,
            tgMessage: ''
        };

        en = {
            subject: emailSubjectEn,
            body: emailBodyEn,
            htmlBody: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <div style="background-color: ${headerColor}; padding: 20px; text-align: center;">
                    <h2 style="color: white; margin: 0;">${titleHtmlEn}</h2>
                </div>
                <div style="padding: 30px; background-color: #ffffff;">
                    <h3 style="color: #111827; margin-top: 0;">Hi ${data.full_name},</h3>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">${messageHtmlEn}</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${data.actualLink}" style="background-color: #4F46E5; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">View Details & Pay</a>
                    </div>
                    
                    <p style="color: #6B7280; font-size: 14px; text-align: center;">If you have already paid, please click the button above to report it to the Admin.</p>
                    
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                    <div style="font-size: 14px; color: #4b5563; background-color: #f9fafb; padding: 15px; border-radius: 6px;">
                        <p style="margin: 0 0 10px 0;"><strong>Admin Contact:</strong></p>
                        <p style="margin: 5px 0;">📞 Zalo/Phone: <strong>0944353323</strong></p>
                        <p style="margin: 5px 0;">📧 Email: <a href="mailto:vndang96@gmail.com" style="color: #1a73e8;">vndang96@gmail.com</a></p>
                        <p style="margin: 5px 0;">🌐 Facebook: <a href="https://www.facebook.com/iamnguyendang" style="color: #1a73e8;" target="_blank">iamnguyendang</a></p>
                    </div>
                </div>
            </div>
            `,
            tgMessage: ''
        };
    } else if (type === 'reminder_admin') {
        let statusLabelVi = '';
        let statusLabelEn = '';

        if (data.days_left > 0) {
            statusLabelVi = 'Sắp đến hạn';
            statusLabelEn = 'Due Soon';
        } else if (data.days_left === 0) {
            statusLabelVi = 'Đến hạn hôm nay';
            statusLabelEn = 'Due Today';
        } else if (data.days_left < 0 && data.days_left > -4) {
            statusLabelVi = `Trễ hạn ${Math.abs(data.days_left)} ngày`;
            statusLabelEn = `Overdue ${Math.abs(data.days_left)} days`;
        } else {
            statusLabelVi = 'Tạm ngưng dịch vụ';
            statusLabelEn = 'Service Suspended';
        }

        vi = {
            subject: '', body: '', htmlBody: '',
            tgMessage: `📧 <b>Đã gửi email nhắc nhở</b>\n👤 Khách hàng: <b>${data.full_name}</b>\n📦 Gói: <b>${data.plan_name}</b>\n🏷 Trạng thái: <b>${statusLabelVi}</b>\n📅 Ngày đến hạn: <b>${data.formattedDate}</b>`
        };

        en = {
            subject: '', body: '', htmlBody: '',
            tgMessage: `📧 <b>Reminder Email Sent</b>\n👤 Customer: <b>${data.full_name}</b>\n📦 Plan: <b>${data.plan_name}</b>\n🏷 Status: <b>${statusLabelEn}</b>\n📅 Due Date: <b>${data.formattedDate}</b>`
        };
    }

    if (lang === 'en') return en;
    if (lang === 'bilingual') {
        return {
            subject: `${vi.subject} | ${en.subject}`,
            body: `${vi.body}\n\n---\n\n${en.body}`,
            htmlBody: `
                ${vi.htmlBody}
                <br />
                <div style="text-align: center; color: #9CA3AF;">- English Version Below -</div>
                <br />
                ${en.htmlBody}
            `,
            tgMessage: `${vi.tgMessage}\n\n---\n\n${en.tgMessage}`
        };
    }
    
    return vi; // Default
}
