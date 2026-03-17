import { Facebook, Instagram, Mail, MapPin, Phone, Twitter } from "lucide-react";
import { footerSections } from "../data/dummyData";

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 px-4 py-16 text-slate-300 sm:px-6 lg:px-8">
      <div className="section-shell grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
        <div className="max-w-md">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-300">
            About Municipal Corporation
          </p>
          <h3 className="font-display mt-4 text-2xl font-bold leading-tight tracking-tight text-white sm:text-[2rem]">
            Building transparent, efficient, and citizen-first city governance
          </h3>
          <p className="mt-4 text-sm leading-7 text-slate-400">
            City Municipal Corporation delivers digital public services, urban
            development programs, and civic support through a secure and modern
            portal experience.
          </p>
        </div>

        <div>
          <h4 className="font-display text-lg font-bold tracking-tight text-white">
            Quick Links
          </h4>
          <ul className="mt-4 space-y-3 text-sm leading-7">
            {footerSections.quickLinks.map((item) => (
              <li key={item}>
                <a href="#home" className="transition hover:text-blue-300">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg font-bold tracking-tight text-white">
            Citizen Services
          </h4>
          <ul className="mt-4 space-y-3 text-sm leading-7">
            {footerSections.citizenServices.map((item) => (
              <li key={item}>
                <a href="#services" className="transition hover:text-blue-300">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg font-bold tracking-tight text-white">
            Contact Information
          </h4>
          <ul className="mt-4 space-y-4 text-sm leading-7 text-slate-400">
            <li className="flex items-start gap-3">
              <MapPin className="mt-1 h-4 w-4 shrink-0 text-blue-300" />
              <span>{footerSections.contact.address}</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="h-4 w-4 shrink-0 text-blue-300" />
              <span>{footerSections.contact.email}</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="h-4 w-4 shrink-0 text-blue-300" />
              <span>{footerSections.contact.phone}</span>
            </li>
          </ul>
          <div className="mt-6 flex items-center gap-3">
            {[Facebook, Twitter, Instagram].map((Icon, index) => (
              <a
                key={index}
                href="#home"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-800 bg-slate-900 text-slate-300 transition hover:border-blue-400 hover:text-blue-300"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="section-shell mt-10 border-t border-slate-800 pt-6 text-sm text-slate-500">
        Copyright 2026 City Municipal Corporation. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
