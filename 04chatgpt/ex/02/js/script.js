
// ==========================================
// 우리들의 댕냥 다이어리
// JavaScript 기능
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

  // ----------------------------------------
  // 1. 사진 슬라이드
  // ----------------------------------------

  const carousel = document.getElementById("photoCarousel");

  const slides = Array.from(
    document.querySelectorAll(".photo-slide")
  );

  const dots = Array.from(
    document.querySelectorAll(".carousel-dot")
  );

  const prevButton = document.getElementById("prevPhoto");
  const nextButton = document.getElementById("nextPhoto");

  const slideAnnouncement =
    document.getElementById("slideAnnouncement");

  let currentSlide = 0;

  // 이미지가 없는 경우 자리 표시를 유지합니다.
  // 이미지가 정상적으로 로드되면 사진을 표시합니다.

  const photoImages = document.querySelectorAll(
    ".photo-slide img"
  );

  photoImages.forEach((image) => {

    function updateImageState() {

      const loaded =
        image.complete && image.naturalWidth > 0;

      image.classList.toggle("is-loaded", loaded);

    }

    image.addEventListener("load", updateImageState);

    image.addEventListener("error", () => {
      image.classList.remove("is-loaded");
    });

    updateImageState();

  });

  // 선택된 사진을 표시합니다.

  function showSlide(index) {

    currentSlide =
      (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {

      slide.hidden = slideIndex !== currentSlide;

    });

    dots.forEach((dot, dotIndex) => {

      dot.classList.toggle(
        "active",
        dotIndex === currentSlide
      );

    });

    slideAnnouncement.textContent =
      `사진 ${currentSlide + 1} / ${slides.length}`;

  }

  // 이전 사진

  prevButton.addEventListener("click", () => {

    showSlide(currentSlide - 1);

  });

  // 다음 사진

  nextButton.addEventListener("click", () => {

    showSlide(currentSlide + 1);

  });

  // 갤러리에 초점이 있을 때 방향키 사용

  carousel.addEventListener("keydown", (event) => {

    if (event.key === "ArrowLeft") {

      event.preventDefault();

      showSlide(currentSlide - 1);

    }

    if (event.key === "ArrowRight") {

      event.preventDefault();

      showSlide(currentSlide + 1);

    }

  });

  // 처음에는 첫 번째 사진을 보여줍니다.

  showSlide(0);


  // ----------------------------------------
  // 2. 좋아요 버튼
  // ----------------------------------------

  const likeButton = document.getElementById("likeButton");

  let isLiked = false;

  likeButton.addEventListener("click", () => {

    // 누를 때마다 좋아요 상태를 반전시킵니다.

    isLiked = !isLiked;

    // 빨간 하트 스타일 적용 또는 해제

    likeButton.classList.toggle("is-liked", isLiked);

    // 접근성 상태 업데이트

    likeButton.setAttribute(
      "aria-pressed",
      String(isLiked)
    );

    likeButton.setAttribute(
      "aria-label",
      isLiked ? "좋아요 취소" : "좋아요"
    );

  });


  // ----------------------------------------
  // 3. 댓글 글자 수 실시간 표시
  // ----------------------------------------

  const commentInput =
    document.getElementById("commentInput");

  const characterCount =
    document.getElementById("characterCount");

  commentInput.addEventListener("input", () => {

    // 일반 문자와 이모지의 유니코드 코드 포인트 계산
    const count = Array.from(commentInput.value).length;

    characterCount.textContent = `${count}자`;

  });


  // ----------------------------------------
  // 4. 댓글 등록 안내 팝업
  // ----------------------------------------

  const commentForm =
    document.getElementById("commentForm");

  const commentNotice =
    document.getElementById("commentNotice");

  const closeNotice =
    document.getElementById("closeNotice");

  commentForm.addEventListener("submit", (event) => {

    // 실제 댓글 등록을 막습니다.
    event.preventDefault();

    // 저장 기능 없이 안내 팝업만 표시합니다.
    if (typeof commentNotice.showModal === "function") {

      commentNotice.showModal();

    } else {

      window.alert(
        "현재 댓글 저장 기능은 지원하지 않습니다."
      );

    }

  });

  // 팝업 확인 버튼

  closeNotice.addEventListener("click", () => {

    commentNotice.close();

  });

});
