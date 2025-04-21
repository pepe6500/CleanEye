export default class mySender {

    static sendToServer(visibleText,imageUrls,harmLevel) {
        
        fetch("http://3.35.204.105:3001/getDatas", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                words: visibleText,
                images: imageUrls,
                dangerScore: harmLevel
            })
        })
            .then(response => {
                if (!response.ok) throw new Error("서버 응답 실패");
                return response.json();
            })
            .then(data => console.log("서버 응답:", data))
            .catch(error => console.error("전송 오류:", error));

    }
}