// 전역 변수
const API_BASE_URL = 'http://localhost:8080';
let editingBookId = null; // 현재 수정 중인 도서 ID

// DOM 요소 참조
const bookForm = document.getElementById('bookForm');
const bookTableBody = document.getElementById('bookTableBody');
const submitButton = bookForm.querySelector('button[type="submit"]');
const cancelButton = bookForm.querySelector('.cancel-btn');
const formError = document.getElementById('formError');

// 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('페이지 로드 완료');
    loadBooks();
});

bookForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(bookForm);
    const bookData = {
        title: formData.get('title').trim(),
        author: formData.get('author').trim(),
        isbn: formData.get('isbn').trim(),
        price: formData.get('price') ? parseInt(formData.get('price')) : null,
        publishDate: formData.get('publishDate') || null,
        detail: {
            description: formData.get('description').trim(),
            language: formData.get('language').trim(),
            pageCount: formData.get('pageCount') ? parseInt(formData.get('pageCount')) : null,
            publisher: formData.get('publisher').trim(),
            coverImageUrl: formData.get('coverImageUrl').trim(),
            edition: formData.get('edition').trim()
        }
    };
    
    // 유효성 검사
    if (!validateBook(bookData)) return;

    if (editingBookId) {
        updateBook(editingBookId, bookData); // 수정
    } else {
        createBook(bookData); // 등록
    }
});

cancelButton.addEventListener('click', function() {
    bookForm.reset();
    editingBookId = null;
    submitButton.textContent = "등록";
});
document.addEventListener("DOMContentLoaded", () => {
    const API_BASE_URL = "http://localhost:8080/api/books";
    const bookForm = document.getElementById("bookForm");
    const bookTableBody = document.getElementById("bookTableBody");
    let editingBookId = null;

    // 도서 목록 불러오기
    async function loadBooks() {
        try {
            const response = await fetch(API_BASE_URL);
            if (!response.ok) throw new Error("서버 응답 오류");
            const books = await response.json();

            bookTableBody.innerHTML = "";
            books.forEach(book => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${book.title}</td>
                    <td>${book.author}</td>
                    <td>${book.isbn}</td>
                    <td>${book.price}</td>
                    <td>${book.publishDate}</td>
                    <td>${book.publisher || "-"}</td>
                    <td>
                        <button onclick="editBook(${book.id})">수정</button>
                        <button onclick="deleteBook(${book.id})">삭제</button>
                    </td>
                `;
                bookTableBody.appendChild(row);
            });
        } catch (error) {
            console.error("에러 발생:", error);
        }
    }

    // 도서 등록/수정
    bookForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const bookData = {
            title: document.getElementById("title").value,
            author: document.getElementById("author").value,
            isbn: document.getElementById("isbn").value,
            price: document.getElementById("price").value,
            publishDate: document.getElementById("publishDate").value
        };

        try {
            let response;
            if (editingBookId) {
                // 수정
                response = await fetch(`${API_BASE_URL}/${editingBookId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(bookData)
                });
                editingBookId = null;
            } else {
                // 등록
                response = await fetch(API_BASE_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(bookData)
                });
            }

            if (!response.ok) throw new Error("등록/수정 실패");
            bookForm.reset();
            await loadBooks();
        } catch (error) {
            console.error("에러 발생:", error);
        }
    });

    // 수정 버튼 클릭 시 데이터 채워넣기
    window.editBook = async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/${id}`);
            if (!response.ok) throw new Error("도서 조회 실패");
            const book = await response.json();

            document.getElementById("title").value = book.title;
            document.getElementById("author").value = book.author;
            document.getElementById("isbn").value = book.isbn;
            document.getElementById("price").value = book.price;
            document.getElementById("publishDate").value = book.publishDate;

            editingBookId = id;
        } catch (error) {
            console.error("에러 발생:", error);
        }
    };

    // 삭제 버튼
    window.deleteBook = async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: "DELETE"
            });
            if (!response.ok) throw new Error("삭제 실패");
            await loadBooks();
        } catch (error) {
            console.error("에러 발생:", error);
        }
    };

    // 첫 로드 시 도서 목록 불러오기
    loadBooks();
});


function loadBooks() {    
    fetch(`${API_BASE_URL}/api/books`)
        .then(response => {
            if (!response.ok) throw new Error("도서 목록 불러오기 실패");
            return response.json();
        })
        .then(books => renderBookTable(books))
        .catch(err => {
            showError(err.message);
            bookTableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center;color:red;">
                        오류: 데이터를 불러올 수 없습니다.
                    </td>
                </tr>`;
        });
}

function renderBookTable(books) {
    bookTableBody.innerHTML = '';
    books.forEach(book => {
        const row = document.createElement('tr');
        const formattedPrice = book.price ? `₩${book.price.toLocaleString()}` : '-';
        const formattedDate = book.publishDate || '-';
        const publisher = book.detail ? book.detail.publisher || '-' : '-';

        row.innerHTML = `
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.isbn}</td>
            <td>${formattedPrice}</td>
            <td>${formattedDate}</td>
            <td>${publisher}</td>
            <td>
                <button onclick="editBook(${book.id})">수정</button>
                <button onclick="deleteBook(${book.id})">삭제</button>
            </td>
        `;
        bookTableBody.appendChild(row);
    });
}

function showError(message) {
    formError.textContent = message;
    formError.style.display = 'block';
    setTimeout(() => {
        formError.textContent = '';
        formError.style.display = 'none';
    }, 3000);
}
