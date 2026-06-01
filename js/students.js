const studentsUrl = "./students.json"; // 내 저장소의 한글 데이터 파일
const latestUrl = "./latest.json";     // 내 저장소의 최신 데이터 체크 파일

let students;

async function loadStudentsAsync() {
    const latestLocal = getLocalStorage(keyDataLatest);

    try {
        const latestResponse = await fetch(latestUrl);
        if (!latestResponse.ok) {
            throw new Error(`HTTP 에러: ${latestResponse.status}`);
        }
        const latestJson = await latestResponse.json();
        const latest = latestJson.latest;

        if (latestLocal != null && latestLocal >= latest) {
            students = getLocalStorage(keyDataStudents);
        } else {
            const studentsResponse = await fetch(studentsUrl);
            if (!studentsResponse.ok) {
                throw new Error(`HTTP 에러: ${studentsResponse.status}`);
            }
            const studentsJson = await studentsResponse.json();
            students = [];
            studentsJson.forEach(oneStudentRaw => {
                let oneStudent = {};
                let dataDict = {};
                let battleClass = 0b00000;

                // js/kivodle.js에서 정의한 한글 배열(weapons, schools 등)의 인덱스를 매칭합니다.
                dataDict['weapon'] = weapons.findIndex(weapon => weapon === oneStudentRaw.weapon);
                dataDict['school'] = schools.findIndex(school => school === oneStudentRaw.school);
                dataDict['attackType'] = attackTypes.findIndex(attackType => attackType === oneStudentRaw.attackType);
                dataDict['implementationDate'] = oneStudentRaw.implDate;
                // ⭐ [수정] 이 줄을 추가해서 별명 데이터도 함께 넣어주어야 합니다!
                dataDict['aliases'] = oneStudentRaw.aliases || []; 


                oneStudentRaw.battleClass.forEach(oneBattleClass => {
                    battleClass += Number(Object.keys(classes).find(k => classes[k] === oneBattleClass));
                });

                dataDict['class'] = battleClass;
                oneStudent['studentName'] = oneStudentRaw.name;
                oneStudent['data'] = dataDict;
                students.push(oneStudent);
            });
            setLocalStorage(keyDataLatest, latest);
            setLocalStorage(keyDataStudents, students);
        }
    } catch (err) {
        console.error("데이터를 가져오는 데 실패했습니다:", err);
    }
}
