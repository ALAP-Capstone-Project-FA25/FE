import { motion } from 'framer-motion';
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Youtube,
  Clock,
  Heart,
  Truck,
  Shield,
  Award
} from 'lucide-react';

const footerLinks = {
  company: [
    { name: 'Về chúng tôi', href: '#' },
    { name: 'Tin tức', href: '#' },
    { name: 'Tuyển dụng', href: '#' },
    { name: 'Liên hệ', href: '#' }
  ],
  services: [
    { name: 'Hoa sinh nhật', href: '#' },
    { name: 'Hoa khai trương', href: '#' },
    { name: 'Hoa cưới', href: '#' },
    { name: 'Hoa tang lễ', href: '#' }
  ],
  support: [
    { name: 'Hướng dẫn đặt hàng', href: '#' },
    { name: 'Chính sách đổi trả', href: '#' },
    { name: 'Giao hàng', href: '#' },
    { name: 'Bảo mật thông tin', href: '#' }
  ]
};

const features = [
  { icon: Heart, text: 'Hoa tươi 100%' },
  { icon: Truck, text: 'Giao hàng nhanh' },
  { icon: Shield, text: 'Bảo đảm chất lượng' },
  { icon: Award, text: 'Uy tín 10+ năm' }
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div>
              <h3 className="mb-2 text-2xl font-bold text-yellow-400">
                FLOWERPLUS.VN
              </h3>
              <p className="text-sm leading-relaxed text-gray-300">
                Chuyên cung cấp hoa tươi chất lượng cao với giá cả hợp lý. Phục
                vụ khách hàng tại TP.HCM và các tỉnh thành lân cận.
              </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-yellow-400" />
                <span>0909 123 456</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-yellow-400" />
                <span>info@flowerplus.vn</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-yellow-400" />
                <span>123 Nguyễn Văn A, Q.1, TP.HCM</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-yellow-400" />
                <span>7:00 - 22:00 (Hàng ngày)</span>
              </div>
            </div>
          </motion.div>

          {/* Company Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h4 className="text-lg font-semibold text-yellow-400">Công ty</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-300 transition-colors duration-200 hover:text-yellow-400"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Services Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h4 className="text-lg font-semibold text-yellow-400">Dịch vụ</h4>
            <ul className="space-y-2">
              {footerLinks.services.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-300 transition-colors duration-200 hover:text-yellow-400"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Support & Social */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h4 className="text-lg font-semibold text-yellow-400">Hỗ trợ</h4>
            <ul className="mb-6 space-y-2">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-300 transition-colors duration-200 hover:text-yellow-400"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>

            {/* Social Media */}
            <div>
              <h5 className="mb-3 text-sm font-semibold text-yellow-400">
                Theo dõi chúng tôi
              </h5>
              <div className="flex gap-3">
                <a
                  href="#"
                  className="rounded-lg bg-gray-800 p-2 transition-all duration-200 hover:bg-yellow-400 hover:text-gray-900"
                >
                  <Facebook className="h-4 w-4" />
                </a>
                <a
                  href="#"
                  className="rounded-lg bg-gray-800 p-2 transition-all duration-200 hover:bg-yellow-400 hover:text-gray-900"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a
                  href="#"
                  className="rounded-lg bg-gray-800 p-2 transition-all duration-200 hover:bg-yellow-400 hover:text-gray-900"
                >
                  <Youtube className="h-4 w-4" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Features Section */}
        <motion.div
          className="mt-12 border-t border-gray-700 pt-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-3 text-center md:text-left"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="rounded-lg bg-yellow-400 p-2">
                  <feature.icon className="h-4 w-4 text-gray-900" />
                </div>
                <span className="text-sm font-medium">{feature.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <motion.div
        className="bg-gray-800 py-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        viewport={{ once: true }}
      >
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-gray-400">
              © 2024 FlowerPlus.vn. Tất cả quyền được bảo lưu.
            </p>
            <div className="flex gap-6 text-sm">
              <a
                href="#"
                className="text-gray-400 transition-colors hover:text-yellow-400"
              >
                Điều khoản sử dụng
              </a>
              <a
                href="#"
                className="text-gray-400 transition-colors hover:text-yellow-400"
              >
                Chính sách bảo mật
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </footer>
  );
}
