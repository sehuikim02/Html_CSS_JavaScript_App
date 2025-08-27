// 전역변수 
        const API_BASE_URL = "http://localhost:8080/api/books";

        const bookForm = document.getElementById("bookForm");
        const bookTableBody = document.getElementById("bookTableBody");

        document.addEventListener("DOMContentLoaded", function () {
            loadBooks();
        });

        // 📌 도서 등록
        bookForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            console.log("도서 등록 요청 수신 되었음...");

            const formData = new FormData(bookForm);
            const bookData = {
                title: (formData.get("title") || "").trim(),
                author: (formData.get("author") || "").trim(),
                isbn: (formData.get("isbn") || "").trim(),
                price: formData.get("price") ? Number(formData.get("price")) : null,
                publishDate: formData.get("publishDate") || ""
            };

            try {
                const response = await fetch(API_BASE_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(bookData)
                });

                if (!response.ok) {
                    throw new Error("도서 등록 실패");
                }

                console.log("도서 등록 성공!");
                bookForm.reset();  // 폼 초기화
                loadBooks();       // 목록 새로고침
            } catch (error) {
                console.error("에러 발생:", error);
            }
        });

        // 📌 도서 목록 조회
        async function loadBooks() {
            console.log("도서 목록 불러오는 중...");
            try {
                const response = await fetch(API_BASE_URL);
                if (!response.ok) {
                    throw new Error("목록 불러오기 실패");
                }
                const books = await response.json();

                bookTableBody.innerHTML = ""; // 초기화
                books.forEach(book => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${book.title}</td>
                        <td>${book.author}</td>
                        <td>${book.isbn}</td>
                        <td>${book.price ?? ""}</td>
                        <td>${book.publishDate ?? ""}</td>
                    `;
                    bookTableBody.appendChild(row);
                });
            } catch (error) {
                console.error("에러 발생:", error);
            }
        }