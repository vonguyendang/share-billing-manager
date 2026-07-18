const translations = {
    vi: {
        // Common
        'lang_vi': 'Tiếng Việt',
        'lang_en': 'English',
        'btn_save': 'Lưu',
        'btn_cancel': 'Hủy',
        'btn_close': 'Đóng',
        'btn_edit': 'Sửa',
        'btn_delete': 'Xóa',
        'btn_add': 'Thêm mới',
        'btn_approve': 'Duyệt',
        'btn_reject': 'Từ chối',
        'status_active': 'Hoạt động',
        'status_inactive': 'Ngừng HĐ',
        'status_pending': 'Đang chờ',
        'status_approved': 'Đã duyệt',
        'status_rejected': 'Từ chối',
        'status_paid': 'Đã thanh toán',
        'status_unpaid': 'Chưa thanh toán',
        'loading': 'Đang tải...',

        // Navigation (Admin)
        'nav_dashboard': 'Tổng quan',
        'nav_members': 'Thành viên',
        'nav_plans': 'Gói cước',
        'nav_subscriptions': 'Thuê bao',
        'nav_pending_req': 'Yêu cầu duyệt',
        'nav_history': 'Lịch sử duyệt',
        'nav_expenses': 'Quỹ chung',
        'nav_reminders': 'Nhắc nhở',
        'nav_settings': 'Cài đặt',
        'nav_logout': 'Đăng xuất',
        'nav_run_reminders': 'Chạy nhắc nhở',
        'sub_amount': 'Số tiền',
        'sub_amount_due': 'Cần thanh toán',
        'sub_cycle': 'Chu kỳ (Tháng)',
        'lbl_total_price': 'Tổng tiền',

        // Navigation (Portal)
        'portal_title': 'Cổng Thông Tin Thành Viên',
        'portal_welcome': 'Xin chào',
        'nav_my_subs': 'Gói cước của tôi',
        'nav_payment_history': 'Lịch sử thanh toán',

        // Dashboard
        'dash_total_monthly': 'Tổng thu dự kiến / tháng',
        'dash_active_members': 'Thành viên đang HĐ',
        'dash_active_plans': 'Gói cước đang HĐ',
        'dash_revenue_30d': 'Thực thu 30 ngày qua',
        'dash_expenses_30d': 'Chi tiêu 30 ngày qua',
        'dash_recent_activity': 'Hoạt động gần đây',
        'dash_overdue': 'Quá hạn / Chưa thanh toán',
        'dash_due_7_days': 'Đến hạn trong 7 ngày tới',
        'dash_plan_util': 'Mức sử dụng Gói (Slots)',

        // Members
        'member_name': 'Tên thành viên',
        'member_email': 'Email',
        'member_phone': 'Số điện thoại',
        'member_note': 'Ghi chú',
        'member_status': 'Trạng thái',
        'member_action': 'Thao tác',
        'member_add': 'Thêm thành viên',
        'member_edit': 'Sửa thành viên',

        // Plans
        'plan_name': 'Tên gói',
        'plan_category': 'Danh mục',
        'plan_total_price': 'Tổng tiền',
        'plan_cycle': 'Chu kỳ (tháng)',
        'plan_anchor_date': 'Ngày mốc gia hạn',
        'plan_note': 'Ghi chú',
        'plan_status': 'Trạng thái',
        'plan_action': 'Thao tác',
        'plan_add': 'Thêm gói cước',
        'plan_edit': 'Sửa gói cước',

        // Subscriptions
        'sub_member': 'Thành viên',
        'sub_plan': 'Gói cước',
        'sub_amount': 'Số tiền',
        'sub_cycle': 'Chu kỳ thu (tháng)',
        'sub_next_date': 'Ngày thu tiếp',
        'sub_status': 'Trạng thái',
        'sub_action': 'Thao tác',
        'sub_add': 'Thêm thuê bao',
        'sub_edit': 'Sửa thuê bao',
        'sub_portal_link': 'Link Portal',
        'sub_copy_link': 'Copy Link',

        // Requests & History
        'req_date': 'Ngày tạo',
        'req_member': 'Thành viên',
        'req_plan': 'Gói cước',
        'req_amount': 'Số tiền',
        'req_note': 'Ghi chú',
        'req_action': 'Thao tác',
        'req_status': 'Trạng thái',
        'req_empty': 'Không có yêu cầu nào đang chờ',
        'hist_empty': 'Không có giao dịch nào gần đây',

        // Portal
        'my_subs_title': 'Gói cước đang sử dụng',
        'payment_hist_title': 'Lịch sử thanh toán của bạn',
        'btn_report_payment': 'Báo đã thanh toán',
        'lbl_amount': 'Số tiền',
        'lbl_cycle': 'Chu kỳ thanh toán',
        'lbl_next_date': 'Kỳ tới',

        // JS Alerts & Prompts
        'msg_confirm_delete': 'Bạn có chắc muốn xóa?',
        'msg_delete_success': 'Đã xóa thành công',
        'msg_save_success': 'Đã lưu thành công',
        'msg_error': 'Có lỗi xảy ra',
        'msg_approve_success': 'Đã duyệt yêu cầu',
        'msg_reject_success': 'Đã từ chối yêu cầu',
        'msg_report_success': 'Đã gửi yêu cầu xác nhận thanh toán',
        'msg_link_copied': 'Đã copy link portal!',

        'msg_invalid_pwd': 'Mật khẩu không hợp lệ',
        'msg_sent_emails': 'Đã gửi {0} email. Có {1} lỗi.',
        'msg_err_loading': 'Lỗi khi tải trang ',
        'msg_no_overdue': 'Không có gói nào quá hạn 🎉',
        'msg_no_upcoming': 'Không có gói nào sắp đến hạn',
        'msg_no_recent': 'Không có giao dịch thanh toán gần đây',
        'lbl_choose_member': '-- Chọn Thành Viên --',
        'lbl_choose_plan': '-- Chọn Gói --',
        'modal_add_plan': 'Thêm Gói Cước',
        'modal_edit_plan': 'Sửa Gói Cước',
        'modal_add_member': 'Thêm Thành Viên',
        'modal_edit_member': 'Sửa Thành Viên',
        'modal_add_sub': 'Thêm Thuê Bao',
        'modal_edit_sub': 'Sửa Thuê Bao',
        'btn_copied': 'Đã Copy!',
        'msg_error': 'Lỗi: ',

        'dash_pending_approvals': 'Chờ duyệt',
        'dash_empty_slots': 'Slot trống',
        'dash_revenue': 'Tổng quan Doanh thu',
        'dash_expected_rev': 'DT Dự kiến',
        'dash_recent_payments': 'Giao dịch gần đây',
        'dash_col_member': 'Thành viên',
        'dash_col_plan': 'Gói',
        'dash_col_amount': 'Số tiền',
        'dash_col_date': 'Ngày',
        'dash_col_actions': 'Thao tác',
        'dash_col_due_date': 'Ngày đến hạn',
        'dash_col_slots': 'Slot (Dùng / Tổng)',
        'dash_col_fill_rate': 'Lấp đầy',
        'title_subs': 'Thuê bao',
        'search_subs': 'Tìm kiếm...',
        'sub_col_cycle': 'Chu kỳ',
        'sub_col_status': 'Trạng thái',
        'sub_col_link': 'Link',
        'title_plans': 'Gói cước',
        'search_plans': 'Tìm kiếm...',
        'plan_col_id': 'ID',
        'plan_col_name': 'Tên',
        'plan_col_category': 'Danh mục',
        'plan_col_price': 'Giá',
        'plan_col_slots': 'Slot',
        'title_members': 'Thành viên',
        'search_members': 'Tìm kiếm...',
        'member_col_phone': 'SĐT',
        'title_pending': 'Chờ thanh toán',
        'pending_col_note': 'Ghi chú',
        'setting_rem_ph': 'VD: 7, 3, 1, 0, -2, -4',
        'setting_bot_lbl': 'Bot Token',
        'setting_bot_ph': 'VD: 123456789:ABCdefGHI',
        'setting_chat_lbl': 'Chat ID',
        'setting_chat_ph': 'VD: -1001234567890',
        'setting_topic_ph': 'VD: 1234',
        'setting_bank_name': 'VD: NGUYEN VAN A',
        'btn_export_members': 'Xuất DS Thành viên',
        'btn_export_subs': 'Xuất DS Thuê bao',
        'btn_export_payments': 'Xuất Giao dịch',
        'btn_export_expenses': 'Xuất Chi phí',
        'btn_save': 'Lưu',
        'btn_cancel': 'Hủy',
        'lbl_name': 'Tên',
        'lbl_category': 'Danh mục',
        'lbl_full_name': 'Họ và Tên',
        'lbl_email': 'Email',
        'lbl_phone': 'Số điện thoại',
        'lbl_social': 'Mạng xã hội / Ghi chú',
        'ph_social': 'Link FB/Zalo hoặc username',
        'lbl_member': 'Thành viên',
        'lbl_plan': 'Gói',
        'lbl_start_date': 'Ngày bắt đầu',
        'lbl_due_date': 'Ngày đến hạn',
        'lbl_status': 'Trạng thái',
        'lbl_sub_send_email': 'Gửi email tự động cho thuê bao này',
        'opt_active': 'Đang HĐ',
        'opt_paused': 'Tạm dừng',
        'opt_pending': 'Chờ thanh toán',

        'lang_switch': 'Tiếng Việt (VI)',
        // Additional
        'theme_light': 'Giao diện Sáng',
        'theme_dark': 'Giao diện Tối',
        'dash_cost': 'Chi phí (Dự toán / Thực tế)',
        'dash_profit': 'Lợi nhuận (Dự toán / Thực tế)',
        'exp_title': 'Quản lý Chi Phí',
        'btn_add_exp': 'Thêm chi phí mới',
        'exp_col_date': 'Ngày chi',
        'exp_col_desc': 'Nội dung',
        'exp_col_action': 'Hành động',
        'setting_title': 'Cài đặt hệ thống',
        'setting_reminder': 'Lịch gửi nhắc nhở (Các mốc ngày)',
        'setting_reminder_desc1': 'Các con số cách nhau bởi dấu phẩy. Dương = Sắp đến hạn. 0 = Đến hạn. Âm = Quá hạn.',
        'setting_reminder_desc2': 'Ví dụ: 7,3,1,0,-2,-4 hoặc 1,0,-2,-4',
        'setting_enable_email': 'Bật tính năng gửi email',
        'setting_tele_title': 'Thông báo Telegram',
        'setting_enable_tele': 'Bật thông báo qua Telegram',
        'setting_bot_token': 'Lấy từ @BotFather',
        'setting_chat_id': 'ID của Group, Supergroup hoặc User',
        'setting_topic_id': 'Topic ID (Tuỳ chọn)',
        'setting_topic_desc': 'Chỉ dùng nếu Chat ID là Supergroup và bạn muốn gửi vào một Topic cụ thể (Message Thread ID)',
        'btn_test_tele': '🚀 Gửi tin nhắn Test (Test Bot)',
        'setting_vietqr': 'Cấu hình thanh toán VietQR',
        'portal_page_title': 'Thanh Toán Dịch Vụ',
        'qr_alt': 'Mã QR Chuyển Khoản',
        'dialog_title_alert': 'Thông báo',
        'dialog_title_confirm': 'Xác nhận',
        'dialog_title_prompt': 'Nhập thông tin',
        'reject_reason_1': 'Admin chưa nhận được tiền trong tài khoản',
        'reject_reason_2': 'Chuyển khoản thiếu tiền',
        'reject_reason_3': 'Chuyển khoản sai nội dung',
        'reject_reason_4': 'Yêu cầu bị trùng lặp',

        // Extra
        'bank_code': 'Mã Ngân Hàng (BIN hoặc Tên viết tắt)',
        'bank_loading': 'Đang tải danh sách ngân hàng...',
        'bank_search': 'Tìm kiếm ngân hàng...',
        'bank_acc': 'Số Tài Khoản',
        'bank_acc_ph': 'Nhập số tài khoản...',
        'bank_owner': 'Tên Chủ Tài Khoản',
        'setting_client_rights': 'Quyền của Khách hàng',
        'setting_client_cancel': 'Cho phép Khách hàng tự thao tác "Huỷ gia hạn" (Cancel)',
        'setting_client_cancel_desc': 'Nếu bật, khách hàng có thể tự nhấn huỷ gia hạn trên Portal. Gói sẽ chuyển sang trạng thái chờ huỷ.',
        'btn_save_setting': 'Lưu Cài Đặt',
        'setting_export': 'Sao lưu Dữ liệu (Export CSV)',
        'setting_export_desc': 'Tải dữ liệu của bạn về máy để sao lưu hoặc làm báo cáo.',
        'hist_title': 'Lịch sử Giao dịch',
        'hist_date': 'Ngày xử lý',
        'hist_client': 'Khách hàng',
        'hist_plan': 'Gói dịch vụ',
        'modal_add_expense': 'Thêm Chi Phí',
        'modal_edit_expense': 'Sửa Chi Phí',
        'lbl_exp_date': 'Ngày chi',
        'lbl_exp_desc': 'Nội dung chi',
        'lbl_exp_desc_ph': 'VD: Mua gói Netflix',
        'lbl_exp_amount': 'Số tiền (VND)',
        'lbl_plan_slots': 'Max Slots (0 = Không giới hạn)',
        'lbl_sub_cycle': 'Chu kỳ thanh toán (Tháng)',
        'portal_err_title': 'Lỗi truy cập',
        'portal_err_desc': 'Liên kết không hợp lệ hoặc đã hết hạn.',
        'portal_lbl_plan': 'Gói:',
        'portal_lbl_member': 'Thành viên:',
        'portal_lbl_start': 'Ngày bắt đầu:',
        'portal_lbl_due': 'Hạn thanh toán:',
        'portal_lbl_amount': 'Số tiền cần thanh toán:',
        'portal_lbl_status': 'Trạng thái:',
        'portal_lbl_transfer': 'Thông tin chuyển khoản:',
        'portal_lbl_bank': 'Ngân hàng:',
        'portal_lbl_acc': 'Số tài khoản:',
        'portal_lbl_owner': 'Chủ tài khoản:',
        'portal_lbl_note': 'Nội dung CK:',
        'portal_lbl_qr': 'Quét QR để thanh toán',
        'portal_confirm_title': 'Xác nhận đã thanh toán',
        'portal_confirm_desc': 'Vui lòng chuyển khoản cho Admin và bấm nút xác nhận bên dưới.',
        'portal_tip_pay_more': '<strong>Mẹo:</strong> Bạn có thể chuyển khoản số tiền lớn hơn hoặc nhỏ hơn yêu cầu. Hệ thống sẽ tự động quy đổi số tiền đó thành số ngày gia hạn tương ứng (VD: chuyển một nửa tiền thì được gia hạn nửa chu kỳ).',
        'portal_note_ph': 'Ghi chú (VD: Đã CK Timo)',
        'portal_btn_confirm': 'Tôi đã chuyển khoản',
        'portal_msg_pending': 'Đã gửi báo cáo thanh toán. Vui lòng chờ admin duyệt.',
        'portal_msg_cancel': 'Bạn đã yêu cầu hủy gia hạn ở chu kỳ sau. Gói dịch vụ sẽ ngắt khi đến hạn.',
        'portal_cancel_desc1': 'Nếu bạn không muốn tiếp tục sử dụng vào chu kỳ sau, hãy bấm nút dưới đây.',
        'portal_btn_cancel': 'Hủy gia hạn chu kỳ sau',
        'dialog_title': 'Thông báo',
        'msg_run_reminders': 'Chạy tiến trình gửi email nhắc nhở cho các mốc ngày: ',
        'msg_no_expense': 'Chưa có dữ liệu chi phí',
        'msg_no_data': 'Không có dữ liệu',
        'msg_confirm_undo': 'Bạn có chắc chắn muốn hoàn tác (Undo) giao dịch này không? Ngày đến hạn của khách hàng sẽ bị lùi lại.',
        'msg_prompt_copy': 'Copy thủ công link bên dưới:',
        'msg_prompt_paid': 'Đánh dấu đã thanh toán tiền. Nhập số tiền đã nhận (VNĐ):',
        'msg_prompt_received': 'Khách đã chuyển khoản bao nhiêu tiền? (Ví dụ: Nhập 100000)',
        'msg_err_amount': 'Vui lòng nhập số tiền hợp lệ lớn hơn 0.',
        'msg_prompt_reject': 'Nhập lý do TỪ CHỐI thanh toán:',
        'msg_warn_del_plan': 'Cảnh báo: Xóa gói này sẽ xóa toàn bộ Subscriptions liên quan! Gõ chữ "DELETE" để xác nhận xóa gói ',
        'msg_warn_del_member': 'Cảnh báo: Xóa thành viên sẽ xóa luôn các Subscriptions của người này. Gõ chữ "DELETE" để xác nhận xóa ',
        'msg_warn_del_sub': 'Gõ chữ "DELETE" để xác nhận xóa Subscription của ',
        'msg_err_bot': 'Vui lòng nhập Bot Token và Chat ID để test!',
        'msg_success': 'Thành công!',
        'lbl_select_bank': 'Chọn ngân hàng...',
        'status_active_txt': 'Đang hoạt động',
        'status_pending_txt': 'Chờ duyệt thanh toán',
        'status_cancel_txt': 'Chờ huỷ gia hạn',
        'msg_portal_sent': 'Cảm ơn bạn! Yêu cầu đã được gửi.',
        'msg_portal_confirm_cancel': 'Bạn có chắc chắn muốn hủy gia hạn? Gói dịch vụ của bạn sẽ tự động kết thúc vào kỳ hạn tiếp theo.',
        'msg_portal_cancel_success': 'Yêu cầu hủy gia hạn thành công.',
        'txt_processing': 'Đang xử lý...',
        'txt_plan_full': ' (Đã Đầy)',
        'txt_plan_unlimited': ' - Không giới hạn',
        'txt_plan_slots_left': ' - Còn '

    },
    en: {
        // Common
        'lang_vi': 'Tiếng Việt',
        'lang_en': 'English',
        'btn_save': 'Save',
        'btn_cancel': 'Cancel',
        'btn_close': 'Close',
        'btn_edit': 'Edit',
        'btn_delete': 'Delete',
        'btn_add': 'Add New',
        'btn_approve': 'Approve',
        'btn_reject': 'Reject',
        'status_active': 'Active',
        'status_inactive': 'Inactive',
        'status_pending': 'Pending',
        'status_approved': 'Approved',
        'status_rejected': 'Rejected',
        'status_paid': 'Paid',
        'status_unpaid': 'Unpaid',
        'loading': 'Loading...',

        // Navigation (Admin)
        'nav_dashboard': 'Dashboard',
        'nav_members': 'Members',
        'nav_plans': 'Plans',
        'nav_subscriptions': 'Subscriptions',
        'nav_pending_req': 'Pending Approvals',
        'nav_history': 'Approval History',
        'nav_expenses': 'Expenses',
        'nav_reminders': 'Reminders',
        'nav_settings': 'Settings',
        'nav_logout': 'Logout',
        'nav_run_reminders': 'Run Reminders',
        'sub_amount': 'Amount',
        'sub_amount_due': 'Amount Due',
        'sub_cycle': 'Cycle (Months)',
        'lbl_total_price': 'Total Price',

        // Navigation (Portal)
        'portal_title': 'Member Portal',
        'portal_welcome': 'Welcome',
        'nav_my_subs': 'My Subscriptions',
        'nav_payment_history': 'Payment History',

        // Dashboard
        'dash_total_monthly': 'Est. Monthly Revenue',
        'dash_active_members': 'Active Members',
        'dash_active_plans': 'Active Plans',
        'dash_revenue_30d': 'Revenue (30 days)',
        'dash_expenses_30d': 'Expenses (30 days)',
        'dash_recent_activity': 'Recent Activity',
        'dash_overdue': 'Overdue / Unpaid',
        'dash_due_7_days': 'Due in Next 7 Days',
        'dash_plan_util': 'Plan Utilization (Slots)',

        // Members
        'member_name': 'Name',
        'member_email': 'Email',
        'member_phone': 'Phone',
        'member_note': 'Note',
        'member_status': 'Status',
        'member_action': 'Action',
        'member_add': 'Add Member',
        'member_edit': 'Edit Member',

        // Plans
        'plan_name': 'Plan Name',
        'plan_category': 'Category',
        'plan_total_price': 'Total Price',
        'plan_cycle': 'Cycle (months)',
        'plan_anchor_date': 'Anchor Date',
        'plan_note': 'Note',
        'plan_status': 'Status',
        'plan_action': 'Action',
        'plan_add': 'Add Plan',
        'plan_edit': 'Edit Plan',

        // Subscriptions
        'sub_member': 'Member',
        'sub_plan': 'Plan',
        'sub_amount': 'Amount',
        'sub_cycle': 'Billing Cycle',
        'sub_next_date': 'Next Due Date',
        'sub_status': 'Status',
        'sub_action': 'Action',
        'sub_add': 'Add Subscription',
        'sub_edit': 'Edit Subscription',
        'sub_portal_link': 'Portal Link',
        'sub_copy_link': 'Copy Link',

        // Requests & History
        'req_date': 'Date',
        'req_member': 'Member',
        'req_plan': 'Plan',
        'req_amount': 'Amount',
        'req_note': 'Note',
        'req_action': 'Action',
        'req_status': 'Status',
        'req_empty': 'No pending requests',
        'hist_empty': 'No recent transactions',

        // Portal
        'my_subs_title': 'Active Subscriptions',
        'payment_hist_title': 'Your Payment History',
        'btn_report_payment': 'Report Payment',
        'lbl_amount': 'Amount',
        'lbl_cycle': 'Billing Cycle',
        'lbl_next_date': 'Next Due Date',

        // JS Alerts & Prompts
        'msg_confirm_delete': 'Are you sure you want to delete this?',
        'msg_delete_success': 'Deleted successfully',
        'msg_save_success': 'Saved successfully',
        'msg_error': 'An error occurred',
        'msg_approve_success': 'Request approved',
        'msg_reject_success': 'Request rejected',
        'msg_report_success': 'Payment confirmation request sent',
        'msg_link_copied': 'Portal link copied!',

        'msg_invalid_pwd': 'Invalid password',
        'msg_sent_emails': 'Sent {0} emails. {1} errors.',
        'msg_err_loading': 'Error loading ',
        'msg_no_overdue': 'No overdue subscriptions 🎉',
        'msg_no_upcoming': 'No upcoming renewals',
        'msg_no_recent': 'No recent payments',
        'lbl_choose_member': '-- Choose Member --',
        'lbl_choose_plan': '-- Choose Plan --',
        'modal_add_plan': 'Add Plan',
        'modal_edit_plan': 'Edit Plan',
        'modal_add_member': 'Add Member',
        'modal_edit_member': 'Edit Member',
        'modal_add_sub': 'Add Subscription',
        'modal_edit_sub': 'Edit Subscription',
        'btn_copied': 'Copied!',
        'msg_error': 'Error: ',

        'dash_pending_approvals': 'Pending Approvals',
        'dash_empty_slots': 'Empty Slots',
        'dash_revenue': 'Revenue Overview',
        'dash_expected_rev': 'Expected Rev',
        'dash_recent_payments': 'Recent Successful Payments',
        'dash_col_member': 'Member',
        'dash_col_plan': 'Plan',
        'dash_col_amount': 'Amount',
        'dash_col_date': 'Date',
        'dash_col_actions': 'Actions',
        'dash_col_due_date': 'Due Date',
        'dash_col_slots': 'Slots (Used / Max)',
        'dash_col_fill_rate': 'Fill Rate',
        'title_subs': 'Subscriptions',
        'search_subs': 'Search subscriptions...',
        'sub_col_cycle': 'Cycle',
        'sub_col_status': 'Status',
        'sub_col_link': 'Link',
        'title_plans': 'Plans',
        'search_plans': 'Search plans...',
        'plan_col_id': 'ID',
        'plan_col_name': 'Name',
        'plan_col_category': 'Category',
        'plan_col_price': 'Price',
        'plan_col_slots': 'Slots',
        'title_members': 'Members',
        'search_members': 'Search members...',
        'member_col_phone': 'Phone',
        'title_pending': 'Pending Payments',
        'pending_col_note': 'Note',
        'setting_rem_ph': 'Ex: 7, 3, 1, 0, -2, -4',
        'setting_bot_lbl': 'Bot Token',
        'setting_bot_ph': 'Ex: 123456789:ABCdefGHI',
        'setting_chat_lbl': 'Chat ID',
        'setting_chat_ph': 'Ex: -1001234567890',
        'setting_topic_ph': 'Ex: 1234',
        'setting_bank_name': 'Ex: JOHN DOE',
        'btn_export_members': 'Export Members',
        'btn_export_subs': 'Export Subscriptions',
        'btn_export_payments': 'Export Payments',
        'btn_export_expenses': 'Export Expenses',
        'btn_save': 'Save',
        'btn_cancel': 'Cancel',
        'lbl_name': 'Name',
        'lbl_category': 'Category',
        'lbl_full_name': 'Full Name',
        'lbl_email': 'Email',
        'lbl_phone': 'Phone',
        'lbl_social': 'Socials / Note',
        'ph_social': 'FB/Zalo link or username',
        'lbl_member': 'Member',
        'lbl_plan': 'Plan',
        'lbl_start_date': 'Start Date',
        'lbl_due_date': 'Next Due Date',
        'lbl_status': 'Status',
        'lbl_sub_send_email': 'Send automatic emails for this subscription',
        'opt_active': 'Active',
        'opt_paused': 'Paused',
        'opt_pending': 'Pending Payment',

        'lang_switch': 'English (EN)',
        // Additional
        'theme_light': 'Light Theme',
        'theme_dark': 'Dark Theme',
        'dash_cost': 'Costs (Budget / Actual)',
        'dash_profit': 'Profit (Budget / Actual)',
        'exp_title': 'Expense Management',
        'btn_add_exp': 'Add New Expense',
        'exp_col_date': 'Date',
        'exp_col_desc': 'Description',
        'exp_col_action': 'Action',
        'setting_title': 'System Settings',
        'setting_reminder': 'Reminder Schedule (Days)',
        'setting_reminder_desc1': 'Comma-separated numbers. Positive = Upcoming. 0 = Due today. Negative = Overdue.',
        'setting_reminder_desc2': 'Example: 7,3,1,0,-2,-4 or 1,0,-2,-4',
        'setting_enable_email': 'Enable Email Notifications',
        'setting_tele_title': 'Telegram Notifications',
        'setting_enable_tele': 'Enable Telegram Notifications',
        'setting_bot_token': 'Get from @BotFather',
        'setting_chat_id': 'ID of Group, Supergroup or User',
        'setting_topic_id': 'Topic ID (Optional)',
        'setting_topic_desc': 'Used only if Chat ID is a Supergroup and you want to send to a specific Topic (Message Thread ID)',
        'btn_test_tele': '🚀 Send Test Message (Test Bot)',
        'setting_vietqr': 'VietQR Payment Configuration',
        'portal_page_title': 'Service Payment',
        'qr_alt': 'Transfer QR Code',
        'dialog_title_alert': 'Notification',
        'dialog_title_confirm': 'Confirmation',
        'dialog_title_prompt': 'Enter Information',
        'reject_reason_1': 'Admin has not received the money',
        'reject_reason_2': 'Insufficient amount transferred',
        'reject_reason_3': 'Incorrect transfer note',
        'reject_reason_4': 'Duplicate request',

        // Extra
        'bank_code': 'Bank Code (BIN or Abbreviation)',
        'bank_loading': 'Loading bank list...',
        'bank_search': 'Search bank...',
        'bank_acc': 'Account Number',
        'bank_acc_ph': 'Enter account number...',
        'bank_owner': 'Account Owner Name',
        'setting_client_rights': 'Client Permissions',
        'setting_client_cancel': 'Allow Client to cancel subscription',
        'setting_client_cancel_desc': 'If enabled, clients can cancel their renewal on the Portal.',
        'btn_save_setting': 'Save Settings',
        'setting_export': 'Data Backup (Export CSV)',
        'setting_export_desc': 'Download your data for backup or reporting.',
        'hist_title': 'Transaction History',
        'hist_date': 'Process Date',
        'hist_client': 'Client',
        'hist_plan': 'Service Plan',
        'modal_add_expense': 'Add Expense',
        'modal_edit_expense': 'Edit Expense',
        'lbl_exp_date': 'Date',
        'lbl_exp_desc': 'Description',
        'lbl_exp_desc_ph': 'Ex: Netflix subscription',
        'lbl_exp_amount': 'Amount',
        'lbl_plan_slots': 'Max Slots (0 = Unlimited)',
        'lbl_sub_cycle': 'Billing Cycle (Months)',
        'portal_err_title': 'Access Error',
        'portal_err_desc': 'Invalid or expired link.',
        'portal_lbl_plan': 'Plan:',
        'portal_lbl_member': 'Member:',
        'portal_lbl_start': 'Start Date:',
        'portal_lbl_due': 'Due Date:',
        'portal_lbl_amount': 'Amount Due:',
        'portal_lbl_status': 'Status:',
        'portal_lbl_transfer': 'Transfer Information:',
        'portal_lbl_bank': 'Bank:',
        'portal_lbl_acc': 'Account No:',
        'portal_lbl_owner': 'Account Name:',
        'portal_lbl_note': 'Transfer Note:',
        'portal_lbl_qr': 'Scan QR to pay',
        'portal_confirm_title': 'Confirm Payment',
        'portal_confirm_desc': 'Please transfer to Admin and click the confirm button below.',
        'portal_tip_pay_more': '<strong>Tip:</strong> You can transfer a larger or smaller amount than requested. The system will automatically convert it into the corresponding number of extension days (e.g., paying half extends for half a cycle).',
        'portal_note_ph': 'Note (e.g., Transferred via Timo)',
        'portal_btn_confirm': 'I Have Transferred',
        'portal_msg_pending': 'Payment report sent. Please wait for admin approval.',
        'portal_msg_cancel': 'You have requested to cancel renewal. Service will stop at due date.',
        'portal_cancel_desc1': 'If you do not want to renew for the next cycle, click below.',
        'portal_btn_cancel': 'Cancel Next Renewal',
        'dialog_title': 'Notification',
        'msg_run_reminders': 'Run email reminder process for dates: ',
        'msg_no_expense': 'No expense data',
        'msg_no_data': 'No data available',
        'msg_confirm_undo': 'Are you sure you want to undo this transaction? The client due date will be reverted.',
        'msg_prompt_copy': 'Copy link manually below:',
        'msg_prompt_paid': 'Mark as paid. Enter amount received:',
        'msg_prompt_received': 'How much did the client transfer? (Ex: 100000)',
        'msg_err_amount': 'Please enter a valid amount greater than 0.',
        'msg_prompt_reject': 'Enter reason for REJECTION:',
        'msg_warn_del_plan': 'Warning: Deleting this plan will remove all related subscriptions! Type "DELETE" to confirm deleting ',
        'msg_warn_del_member': 'Warning: Deleting member removes their subscriptions. Type "DELETE" to confirm deleting ',
        'msg_warn_del_sub': 'Type "DELETE" to confirm deleting subscription for ',
        'msg_err_bot': 'Please enter Bot Token and Chat ID to test!',
        'msg_success': 'Success!',
        'lbl_select_bank': 'Select bank...',
        'status_active_txt': 'Active',
        'status_pending_txt': 'Pending Approval',
        'status_cancel_txt': 'Cancellation Pending',
        'msg_portal_sent': 'Thank you! Your request has been sent.',
        'msg_portal_confirm_cancel': 'Are you sure you want to cancel renewal? Your service will end at the next due date.',
        'msg_portal_cancel_success': 'Renewal cancellation requested successfully.',
        'txt_processing': 'Processing...',
        'txt_plan_full': ' (Full)',
        'txt_plan_unlimited': ' - Unlimited',
        'txt_plan_slots_left': ' - Slots left: '

    }
};

let currentLanguage = localStorage.getItem('appLanguage') || 'vi';

function setLanguage(lang) {
    if (translations[lang] && lang !== currentLanguage) {
        currentLanguage = lang;
        localStorage.setItem('appLanguage', lang);
        window.location.reload();
    }
}

function getLanguage() {
    return currentLanguage;
}

function t(key) {
    const dict = translations[currentLanguage] || translations['vi'];
    return dict[key] || key;
}

function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLanguage] && translations[currentLanguage][key]) {
            if (el.tagName === 'INPUT' && (el.type === 'button' || el.type === 'submit')) {
                el.value = t(key);
            } else {
                el.innerHTML = t(key);
            }
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[currentLanguage] && translations[currentLanguage][key]) {
            el.placeholder = t(key);
        }
    });

    // Update active state of language switcher if exists
    document.querySelectorAll('.lang-btn').forEach(btn => {
        if (btn.dataset.lang === currentLanguage) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function formatCurrency(amount) {
    if (currentLanguage === 'vi') {
        return amount.toLocaleString('vi-VN') + ' đ';
    } else {
        return '₫' + amount.toLocaleString('en-US');
    }
}

function formatDate(dateInput, options = {}) {
    if (!dateInput) return '';
    let date;
    let hasTime = false;
    
    if (dateInput instanceof Date) {
        date = dateInput;
        hasTime = date.getHours() !== 0 || date.getMinutes() !== 0;
    } else {
        let dateStr = String(dateInput);
        // Convert SQLite YYYY-MM-DD HH:MM:SS to YYYY-MM-DDTHH:MM:SS
        if (dateStr.includes(' ') && !dateStr.includes('T')) {
            dateStr = dateStr.replace(' ', 'T');
        }
        
        hasTime = dateStr.includes('T');
        
        if (hasTime) {
            date = new Date(dateStr.includes('Z') ? dateStr : dateStr + 'Z');
        } else {
            date = new Date(dateStr + 'T00:00:00Z');
        }
    }
    
    const locale = currentLanguage === 'vi' ? 'vi-VN' : 'en-US';

    // Default options if none provided and dateStr doesn't include time
    let finalOptions = { ...options };
    if (Object.keys(options).length === 0) {
        finalOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
        if (hasTime) {
            finalOptions.hour = '2-digit';
            finalOptions.minute = '2-digit';
        }
    }

    return date.toLocaleString(locale, finalOptions);
}

document.addEventListener('DOMContentLoaded', () => {
    applyTranslations();
});

// Expose explicitly to window to fix ReferenceError in modules
window.t = t;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.setLanguage = setLanguage;

// Provide a toggle function
window.toggleLanguage = function() {
    const newLang = currentLanguage === 'vi' ? 'en' : 'vi';
    setLanguage(newLang);
};
