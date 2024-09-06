import anijaImage from '../aboutUs-images/IMG_2940.png';
import antonioImage from '../aboutUs-images/antonioImage.png';
import chrisImage from '../aboutUs-images/chrisImage.png'
const AboutUsPage = () => {
  return (
    <>
      <div className="about-us-container">
        <h1>Read All About Us!</h1>

        {/* Anija */}
        <div className="profile-container">
          <div className="info-container">
            <p id="about-p">
            Hello! my name is Anija-Khallil Robinson, an aspiring software engineer with a love for problem solving and creativity.
            I was born and raised in Syracuse, NY where early on I was surrounded by
            sports and music and developed a passion for both. Raised around computer
            savvy family members I later grew an interest towards tech without even realizing.
            Starting out mixing and recording audio, producing, and setting up studio equipment.
            I offer creative solutions, I love thinking outside of the box.
            I’m committed to supporting and encouraging my teammates in anyway that I can.
            I pride myself on not only being a great colleague but an even greater friend.
            </p>
          </div>
          <div className="picHolder">
            <h3 id="aboutUsH3">Anija-Khallil Robinson</h3>
            <img src={anijaImage} alt="Anija-Khallil" className="profileImage" />
          </div>
        </div>

        {/* Antonio */}
        <div className="profile-container">
          <div className="picHolder">
            <h1 id="aboutUsH3">Antonio Ramirez</h1>
            <img src={antonioImage} alt="Antonio-Ramirez" className="profileImage" />
          </div>
          <div className="info-container">
            <p  id="about-p">Hi, I'm Antonio—a naturally curious developer with a passion for building and creating. I love diving into how things work, whether it’s cars or software, always eager to explore and understand the mechanics behind them. My curiosity drives me to solve problems and craft innovative solutions, ensuring that everything I work on is both functional and reliable. I bring a meticulous approach to every project, with a strong focus on quality and efficiency. I believe in the power of collaboration and value strong, supportive relationships, always putting family first. Let’s create something great together!</p>
          </div>
        </div>

        {/* Chris */}
        <div className="profile-container">
          <div className="info-container">
            <p id="about-p">Hello, my name is Chris Chambers. I’ve been married to my beautiful wife for 9 years, and together we have an amazing 3-year-old daughter. We live in southeastern PA, where I enjoy everything tech-related, especially problem-solving. My love for both coding and hardware led me to transition from a career as a biomedical technician into full-stack development. Whether it's diving into new technologies or tinkering with hardware, I’m always eager to learn and grow in the ever-evolving world of tech.</p>
          </div>
          <div className="picHolder">
            <h1 id="aboutUsH3">Chris Chambers</h1>
            <img src={chrisImage} alt="Chris-Chambers" className="profileImage" />
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutUsPage;
