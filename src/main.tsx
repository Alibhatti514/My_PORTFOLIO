import ReactDOM from 'react-dom/client';
import '@fontsource/manrope/latin-400.css';
import '@fontsource/manrope/latin-600.css';
import '@fontsource/ibm-plex-mono/latin-400.css';
import App from './App';
import {SignatureMotion} from './components/SignatureMotion';
import './shadcn.css';
import './styles.css';
import './architectural.css';
import './components/certificate-stack.css';
import './components/certificate-scroll.css';
import './atelier.css';
import './components/macbook-project-logos.css';
import { installAtelierTokens } from './scene/atelierTokens';
installAtelierTokens();

ReactDOM.createRoot(document.getElementById('root')!).render(<><App/><SignatureMotion/></>);
