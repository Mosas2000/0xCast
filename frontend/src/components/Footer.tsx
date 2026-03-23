import { Link } from 'react-router-dom';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="border-t border-neutral-800/50 bg-black mt-auto">
      <div className="container py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2">
            <Logo size="sm" />
            <p className="mt-4 text-neutral-500 text-sm max-w-xs">
              Decentralized prediction markets built on Bitcoin through Stacks.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a href="https://twitter.com/0xCast" target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="https://github.com/0xCast" target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">Platform</h4>
            <ul className="space-y-3">
              <li><Link to="/markets" className="text-neutral-500 hover:text-white text-sm transition-colors">Markets</Link></li>
              <li><Link to="/portfolio" className="text-neutral-500 hover:text-white text-sm transition-colors">Portfolio</Link></li>
              <li>
                <a href="https://explorer.hiro.so/address/SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T?chain=mainnet" target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-white text-sm transition-colors">
                  Contract
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">Resources</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-neutral-500 hover:text-white text-sm transition-colors">Docs</a></li>
              <li><a href="#" className="text-neutral-500 hover:text-white text-sm transition-colors">API</a></li>
              <li><a href="#" className="text-neutral-500 hover:text-white text-sm transition-colors">Terms</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-neutral-800/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-neutral-600 text-sm">© 2026 0xCast. All rights reserved.</p>
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <span>Secured by</span>
            <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.546z" />
            </svg>
            <span>Bitcoin</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
