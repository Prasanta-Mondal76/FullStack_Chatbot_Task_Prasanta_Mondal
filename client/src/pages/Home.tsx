import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Services from '../components/Services';
import Courses from '../components/Courses';
import EnquiryForm from '../components/EnquiryForm';
import Footer from '../components/Footer';
import ChatWidget from '../components/ChatWidget';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Services />
        <Courses />
        <EnquiryForm />
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}
