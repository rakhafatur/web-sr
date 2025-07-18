import { useMediaQuery } from 'react-responsive';
import HomePageMobile from './HomePageMobile';
import HomePageDesktop from './HomePageDesktop';

function HomePage() {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  return isMobile ? <HomePageMobile /> : <HomePageDesktop />;
}

export default HomePage;