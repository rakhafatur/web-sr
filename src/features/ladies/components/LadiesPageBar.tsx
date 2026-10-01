import MobilePageBar from '../../../components/MobilePageBar';

/** Bar atas halaman ladies versi mobile — tombol kembali selalu ke Home Ladies. */
const LadiesPageBar = ({ title }: { title: string }) => (
  <MobilePageBar title={title} backTo="/ladies/home" />
);

export default LadiesPageBar;
